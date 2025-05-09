'use client';

import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskContext } from '@/components/dashboards/TaskProvider';
import { Task, STAGES, PRODUCTS } from '@/types/task';
import { calculateSchedulePercentage } from '@/lib/taskUtils';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StageProgressData {
  stageName: string;
  progress: number;
  color: string;
  taskCount: number;
  completedCount: number;
  inProgressCount: number;
  earlyFinishCount: number;
  yetToStartCount: number;
  earlyStartCount: number;
  delayedCount: number;
  beforeTimeCount: number;
  onTimeCount: number;
  criticallyDelayedCount: number;
}

interface ProductProgressData {
  productName: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  earlyFinishCount: number;
  yetToStartCount: number;
  earlyStartCount: number;
  delayedCount: number;
  beforeTimeCount: number;
  onTimeCount: number;
  criticallyDelayedCount: number;
}

interface ProductStageProgressData {
  productName: string;
  stageProgress: StageProgressData[];
}

interface FinancialMilestoneData {
  milestoneName: string;
  value: number;
  invoiceRaised: number;
  received: number;
  progress: number;
  dueDate: Date | null;
  poNumber: string;
}

interface GoLiveTaskData {
  taskName: string;
  progress: number;
  dueDate: Date | null;
  delayDays: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface DelayBucketData {
  bucket: string;
  count: number;
  tasks: { id: string; name: string; delay: number }[];
}

interface ProductGoLiveData {
  productName: string;
  delay: number;
  plannedGoLiveDate: Date | null;
  estimatedGoLiveDate: Date | null;
}

const DashboardCharts: FC = () => {
  const { tasks, loading } = useTaskContext();
  const [stageProgressData, setStageProgressData] = useState<StageProgressData[]>([]);
  const [productProgressData, setProductProgressData] = useState<ProductProgressData[]>([]);
  const [productStageProgressData, setProductStageProgressData] = useState<ProductStageProgressData[]>([]);
  const [financialMilestones, setFinancialMilestones] = useState<FinancialMilestoneData[]>([]);
  const [goLiveTaskData, setGoLiveTaskData] = useState<GoLiveTaskData[]>([]);
  const [delayBucketData, setDelayBucketData] = useState<DelayBucketData[]>([]);
  const [totalFinancialValue, setTotalFinancialValue] = useState(0);
  const [totalReceivedValue, setTotalReceivedValue] = useState(0);
  const [totalInvoiceRaised, setTotalInvoiceRaised] = useState(0);
  const [productGoLiveData, setProductGoLiveData] = useState<ProductGoLiveData[]>([]);

  // Calculate stage progress data
  useEffect(() => {
    if (loading || tasks.length === 0) return;

    // Filter out deleted tasks and only include visible tasks
    const activeTasks = tasks.filter(task => !task.isDeleted);

    // Step 1: Stage-wise progress
    const stageData: Record<string, { 
      tasks: Task[], 
      progress: number, 
      count: number,
      completed: number,
      inProgress: number,
      earlyFinish: number,
      yetToStart: number,
      earlyStart: number,
      delayed: number,
      beforeTime: number,
      onTime: number,
      criticallyDelayed: number
    }> = {};

    // Initialize stage data
    STAGES.forEach(stage => {
      stageData[stage.id] = { 
        tasks: [], 
        progress: 0, 
        count: 0,
        completed: 0,
        inProgress: 0,
        earlyFinish: 0,
        yetToStart: 0,
        earlyStart: 0,
        delayed: 0,
        beforeTime: 0,
        onTime: 0,
        criticallyDelayed: 0
      };
    });

    // Helper function to determine detailed task status based on schedule and progress
    const getDetailedTaskStatus = (task: Task): string => {
      const schedulePercentage = task.startDate && task.endDate 
        ? calculateSchedulePercentage(task.startDate, task.endDate)
        : 0;
      const progress = task.progress || 0;
      
      // First check for critical conditions
      if (schedulePercentage === 100 && progress < 100) {
        return "Critically Delayed";
      }

      // Then check for completion states
      if (progress === 100) {
        if (schedulePercentage < 100) {
          return "Early Finish";
        }
        return "Completed";
      }

      // Check for not started state
      if (schedulePercentage === 0 && progress === 0) {
        return "Yet to Start";
      }

      // Check for early start
      if (schedulePercentage === 0 && progress > 0) {
        return "Early Start";
      }

      // Check for delayed states
      if (schedulePercentage > progress) {
        return "Delayed";
      }

      // Check for ahead of schedule
      if (schedulePercentage < progress) {
        return "Before Time";
      }

      // Default case - on schedule
      return "On Time";
    };

    // Group tasks by stage and calculate detailed status metrics
    activeTasks.filter(task => !task.isParent && task.stageId).forEach(task => {
      if (task.stageId && stageData[task.stageId]) {
        const status = getDetailedTaskStatus(task);
        stageData[task.stageId].tasks.push(task);
        stageData[task.stageId].count += 1;
        
        switch(status) {
          case "Completed":
          case "Early Finish":
            stageData[task.stageId].completed += 1;
            if (status === "Early Finish") stageData[task.stageId].earlyFinish += 1;
            break;
          case "Yet to Start":
            stageData[task.stageId].yetToStart += 1;
            break;
          case "Early Start":
            stageData[task.stageId].earlyStart += 1;
            stageData[task.stageId].inProgress += 1;
            break;
          case "Delayed":
            stageData[task.stageId].delayed += 1;
            stageData[task.stageId].inProgress += 1;
            break;
          case "Before Time":
            stageData[task.stageId].beforeTime += 1;
            stageData[task.stageId].inProgress += 1;
            break;
          case "On Time":
            stageData[task.stageId].onTime += 1;
            stageData[task.stageId].inProgress += 1;
            break;
          case "Critically Delayed":
            stageData[task.stageId].criticallyDelayed += 1;
            stageData[task.stageId].inProgress += 1;
            break;
        }
      }
    });

    // Calculate average progress for each stage
    const stageProgress: StageProgressData[] = STAGES.map(stage => {
      const data = stageData[stage.id];
      const avgProgress = data.tasks.length > 0 
        ? data.tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / data.tasks.length
        : 0;
      
      return {
        stageName: stage.name,
        progress: Math.round(avgProgress),
        color: stage.colorCode,
        taskCount: data.count,
        completedCount: data.completed,
        inProgressCount: data.inProgress,
        earlyFinishCount: data.earlyFinish,
        yetToStartCount: data.yetToStart,
        earlyStartCount: data.earlyStart,
        delayedCount: data.delayed,
        beforeTimeCount: data.beforeTime,
        onTimeCount: data.onTime,
        criticallyDelayedCount: data.criticallyDelayed
      };
    }).filter(stageData => stageData.taskCount > 0); // Only include stages with tasks

    setStageProgressData(stageProgress);

    // Step 2: Product-wise progress
    const productData: Record<string, {
      totalTasks: number,
      completedTasks: number,
      inProgressTasks: number,
      progress: number,
      earlyFinish: number,
      yetToStart: number,
      earlyStart: number,
      delayed: number,
      beforeTime: number,
      onTime: number,
      criticallyDelayed: number
    }> = {};

    // Initialize product data
    PRODUCTS.forEach(product => {
      productData[product.id] = {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        progress: 0,
        earlyFinish: 0,
        yetToStart: 0,
        earlyStart: 0,
        delayed: 0,
        beforeTime: 0,
        onTime: 0,
        criticallyDelayed: 0
      };
    });

    // Calculate progress for each product with detailed status
    activeTasks.filter(task => !task.isParent && task.productId).forEach(task => {
      if (task.productId && productData[task.productId]) {
        const status = getDetailedTaskStatus(task);
        productData[task.productId].totalTasks += 1;
        
        switch(status) {
          case "Completed":
          case "Early Finish":
            productData[task.productId].completedTasks += 1;
            if (status === "Early Finish") productData[task.productId].earlyFinish += 1;
            break;
          case "Yet to Start":
            productData[task.productId].yetToStart += 1;
            break;
          case "Early Start":
            productData[task.productId].earlyStart += 1;
            productData[task.productId].inProgressTasks += 1;
            break;
          case "Delayed":
            productData[task.productId].delayed += 1;
            productData[task.productId].inProgressTasks += 1;
            break;
          case "Before Time":
            productData[task.productId].beforeTime += 1;
            productData[task.productId].inProgressTasks += 1;
            break;
          case "On Time":
            productData[task.productId].onTime += 1;
            productData[task.productId].inProgressTasks += 1;
            break;
          case "Critically Delayed":
            productData[task.productId].criticallyDelayed += 1;
            productData[task.productId].inProgressTasks += 1;
            break;
        }
      }
    });

    // Calculate progress percentage for each product
    PRODUCTS.forEach(product => {
      const data = productData[product.id];
      data.progress = data.totalTasks > 0
        ? Math.round((data.completedTasks / data.totalTasks) * 100)
        : 0;
    });

    const productProgress: ProductProgressData[] = PRODUCTS.map(product => ({
      productName: product.name,
      progress: productData[product.id].progress,
      totalTasks: productData[product.id].totalTasks,
      completedTasks: productData[product.id].completedTasks,
      inProgressTasks: productData[product.id].inProgressTasks,
      earlyFinishCount: productData[product.id].earlyFinish,
      yetToStartCount: productData[product.id].yetToStart,
      earlyStartCount: productData[product.id].earlyStart,
      delayedCount: productData[product.id].delayed,
      beforeTimeCount: productData[product.id].beforeTime,
      onTimeCount: productData[product.id].onTime,
      criticallyDelayedCount: productData[product.id].criticallyDelayed
    })).filter(productData => productData.totalTasks > 0); // Only include products with tasks

    setProductProgressData(productProgress);

    // Step 3: Product's Stage-wise progress
    const productStageData: Record<string, Record<string, {
      tasks: Task[],
      progress: number,
      count: number,
      completed: number,
      inProgress: number,
      earlyFinish: number,
      yetToStart: number,
      earlyStart: number,
      delayed: number,
      beforeTime: number,
      onTime: number,
      criticallyDelayed: number
    }>> = {};

    // Initialize product-stage data
    PRODUCTS.forEach(product => {
      productStageData[product.id] = {};
      STAGES.forEach(stage => {
        productStageData[product.id][stage.id] = {
          tasks: [],
          progress: 0,
          count: 0,
          completed: 0,
          inProgress: 0,
          earlyFinish: 0,
          yetToStart: 0,
          earlyStart: 0,
          delayed: 0,
          beforeTime: 0,
          onTime: 0,
          criticallyDelayed: 0
        };
      });
    });

    // Group tasks by product and stage
    activeTasks.filter(task => !task.isParent && task.productId && task.stageId).forEach(task => {
      if (task.productId && task.stageId && 
          productStageData[task.productId] && 
          productStageData[task.productId][task.stageId]) {
        const status = getDetailedTaskStatus(task);
        productStageData[task.productId][task.stageId].tasks.push(task);
        productStageData[task.productId][task.stageId].count += 1;
        
        switch(status) {
          case "Completed":
          case "Early Finish":
            productStageData[task.productId][task.stageId].completed += 1;
            if (status === "Early Finish") productStageData[task.productId][task.stageId].earlyFinish += 1;
            break;
          case "Yet to Start":
            productStageData[task.productId][task.stageId].yetToStart += 1;
            break;
          case "Early Start":
            productStageData[task.productId][task.stageId].earlyStart += 1;
            productStageData[task.productId][task.stageId].inProgress += 1;
            break;
          case "Delayed":
            productStageData[task.productId][task.stageId].delayed += 1;
            productStageData[task.productId][task.stageId].inProgress += 1;
            break;
          case "Before Time":
            productStageData[task.productId][task.stageId].beforeTime += 1;
            productStageData[task.productId][task.stageId].inProgress += 1;
            break;
          case "On Time":
            productStageData[task.productId][task.stageId].onTime += 1;
            productStageData[task.productId][task.stageId].inProgress += 1;
            break;
          case "Critically Delayed":
            productStageData[task.productId][task.stageId].criticallyDelayed += 1;
            productStageData[task.productId][task.stageId].inProgress += 1;
            break;
        }
      }
    });

    // Calculate progress for each product-stage combination
    const productStageProgress: ProductStageProgressData[] = PRODUCTS.map(product => {
      const stageProgressForProduct = STAGES.map(stage => {
        const data = productStageData[product.id][stage.id];
        const avgProgress = data.tasks.length > 0
          ? data.tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / data.tasks.length
          : 0;
        
        return {
          stageName: stage.name,
          progress: Math.round(avgProgress),
          color: stage.colorCode,
          taskCount: data.count,
          completedCount: data.completed,
          inProgressCount: data.inProgress,
          earlyFinishCount: data.earlyFinish,
          yetToStartCount: data.yetToStart,
          earlyStartCount: data.earlyStart,
          delayedCount: data.delayed,
          beforeTimeCount: data.beforeTime,
          onTimeCount: data.onTime,
          criticallyDelayedCount: data.criticallyDelayed
        };
      }).filter(stageData => stageData.taskCount > 0); // Only include stages with tasks

      return {
        productName: product.name,
        stageProgress: stageProgressForProduct
      };
    }).filter(productData => productData.stageProgress.length > 0); // Only include products with stage data

    setProductStageProgressData(productStageProgress);

    // Process financial milestones
    const milestones: FinancialMilestoneData[] = tasks
      .filter(task => task.financialMilestone && task.financialValue && task.financialValue > 0)
      .map(task => {
        // Generate a random PO number
        const poNumber = `PO${Math.floor(Math.random() * 900 + 100)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        // For each milestone, determine invoice raised amount (between 0 and 100% of value)
        const value = task.financialValue || 0;
        let invoicePercentage = 0;
        
        // Higher probability of invoices for completed tasks
        if (task.progress === 100) {
          invoicePercentage = Math.random() > 0.3 ? 1 : Math.random() * 0.8;
        } else if (task.progress > 70) {
          invoicePercentage = Math.random() > 0.5 ? 0.7 : Math.random() * 0.6;
        } else if (task.progress > 30) {
          invoicePercentage = Math.random() > 0.7 ? 0.3 : Math.random() * 0.3;
        } else {
          invoicePercentage = Math.random() > 0.9 ? 0.1 : 0;
        }
        
        const invoiceRaised = Math.round(value * invoicePercentage);
        
        // For raised invoices, determine received amount (between 0 and 100% of invoiced)
        let receivedPercentage = 0;
        
        if (invoiceRaised > 0) {
          // Higher probability of payment for older invoices
          if (task.progress === 100) {
            receivedPercentage = Math.random() > 0.2 ? 1 : Math.random() * 0.9;
          } else if (task.progress > 70) {
            receivedPercentage = Math.random() > 0.4 ? 0.8 : Math.random() * 0.7;
          } else if (task.progress > 30) {
            receivedPercentage = Math.random() > 0.6 ? 0.5 : Math.random() * 0.4;
          } else {
            receivedPercentage = Math.random() > 0.8 ? 0.2 : 0;
          }
        }
        
        const received = Math.round(invoiceRaised * receivedPercentage);
        
        return {
          milestoneName: task.taskName,
          value,
          invoiceRaised,
          received,
          progress: task.progress || 0,
          dueDate: task.endDate,
          poNumber
        };
      })
      .sort((a, b) => (b.value - b.received) - (a.value - a.received));
    
    setFinancialMilestones(milestones);
    setTotalFinancialValue(milestones.reduce((sum, m) => sum + m.value, 0));
    setTotalInvoiceRaised(milestones.reduce((sum, m) => sum + m.invoiceRaised, 0));
    setTotalReceivedValue(milestones.reduce((sum, m) => sum + m.received, 0));
    
    // Go-Live Task Data
    const goLiveTasks = activeTasks.filter(task => task.goLive);
    const taskGoLiveData = goLiveTasks.map(task => ({
      taskName: task.taskName,
      progress: task.progress,
      dueDate: task.endDate,
      delayDays: task.delayDays || 0,
      startDate: task.startDate,
      endDate: task.endDate
    })).sort((a, b) => {
      // Sort by completion first, then by due date
      if (a.progress === 100 && b.progress !== 100) return -1;
      if (a.progress !== 100 && b.progress === 100) return 1;
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      return 0;
    });
    setGoLiveTaskData(taskGoLiveData);
    
    // Delay Buckets
    // Only include non-parent tasks with delays
    const delayedTasks = activeTasks.filter(task => 
      !task.isParent && 
      task.delayDays && 
      task.delayDays > 0
    );
    
    // Create buckets: 1-5 days, 6-10 days, 11-20 days, 20+ days
    const buckets: Record<string, { 
      count: number, 
      tasks: { id: string; name: string; delay: number }[] 
    }> = {
      '1-5 days': { count: 0, tasks: [] },
      '6-10 days': { count: 0, tasks: [] },
      '11-20 days': { count: 0, tasks: [] },
      '20+ days': { count: 0, tasks: [] }
    };
    
    // Assign tasks to buckets
    delayedTasks.forEach(task => {
      const delay = task.delayDays || 0;
      let bucket: string;
      
      if (delay <= 5) bucket = '1-5 days';
      else if (delay <= 10) bucket = '6-10 days';
      else if (delay <= 20) bucket = '11-20 days';
      else bucket = '20+ days';
      
      buckets[bucket].count++;
      buckets[bucket].tasks.push({
        id: task.id,
        name: task.taskName,
        delay: delay
      });
    });
    
    // Format for chart display
    const bucketData = Object.entries(buckets).map(([bucket, data]) => ({
      bucket,
      count: data.count,
      tasks: data.tasks
    }));
    setDelayBucketData(bucketData);

    // Calculate product go-live data
    const goLiveDataByProduct: Record<string, ProductGoLiveData> = {};
    
    // Find all go-live tasks
    const goLiveTasksByProduct = goLiveTasks.filter(task => task.productId);
    
    // Group by product and calculate go-live dates and delays
    PRODUCTS.forEach(product => {
      const productGoLiveTasks = goLiveTasksByProduct.filter(task => task.productId === product.id);
      
      if (productGoLiveTasks.length > 0) {
        // Sort by date to find the last planned go-live date
        const sortedByDate = [...productGoLiveTasks].sort((a, b) => 
          (a.endDate?.getTime() || 0) - (b.endDate?.getTime() || 0)
        );
        
        const lastTask = sortedByDate[sortedByDate.length - 1];
        const plannedGoLiveDate = lastTask.endDate;
        
        // Calculate average delay for the product's go-live tasks
        const totalDelay = productGoLiveTasks.reduce((sum, task) => sum + (task.delayDays || 0), 0);
        const avgDelay = Math.round(totalDelay / productGoLiveTasks.length);
        
        // Calculate estimated go-live date based on delay
        let estimatedGoLiveDate = null;
        if (plannedGoLiveDate && avgDelay > 0) {
          estimatedGoLiveDate = new Date(plannedGoLiveDate);
          estimatedGoLiveDate.setDate(plannedGoLiveDate.getDate() + avgDelay);
        } else if (plannedGoLiveDate) {
          estimatedGoLiveDate = new Date(plannedGoLiveDate);
        }
        
        goLiveDataByProduct[product.id] = {
          productName: product.name,
          delay: avgDelay,
          plannedGoLiveDate,
          estimatedGoLiveDate
        };
      } else {
        // If no go-live tasks found for this product, create a default entry with future date
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 90 + Math.floor(Math.random() * 30));
        
        goLiveDataByProduct[product.id] = {
          productName: product.name,
          delay: 0,
          plannedGoLiveDate: futureDate,
          estimatedGoLiveDate: futureDate
        };
      }
    });
    
    // Convert to array
    const productGoLiveDataArray = Object.values(goLiveDataByProduct);
    setProductGoLiveData(productGoLiveDataArray);
  }, [tasks, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 w-full">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-t-transparent border-r-blue-300 border-b-transparent border-l-blue-500 rounded-full animate-spin animation-delay-200"></div>
        </div>
        <p className="text-gray-500 mt-6 animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

  // Modify the stage progress bar chart to show detailed task statuses
  const renderStageProgressCharts = () => {
    if (stageProgressData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <p className="text-gray-500 font-medium">No stage data available</p>
          <p className="text-gray-400 text-sm mt-1">Stage data will appear once tasks are added to stages</p>
        </div>
      );
    }

    return (
      <Bar
        data={{
          labels: stageProgressData.map(s => s.stageName),
          datasets: [
            {
              label: 'Early Finish',
              data: stageProgressData.map(s => s.earlyFinishCount),
              backgroundColor: 'rgba(74, 222, 128, 0.9)', // green-400
              borderColor: 'rgb(74, 222, 128)',
              borderWidth: 1,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
            {
              label: 'Completed',
              data: stageProgressData.map(s => s.completedCount - s.earlyFinishCount),
              backgroundColor: 'rgba(16, 185, 129, 0.9)', // green-600
              borderColor: 'rgb(16, 185, 129)',
              borderWidth: 1,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
            {
              label: 'Before Time',
              data: stageProgressData.map(s => s.beforeTimeCount),
              backgroundColor: 'rgba(163, 230, 53, 0.9)', // lime-400
              borderColor: 'rgb(163, 230, 53)',
              borderWidth: 1,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
            {
              label: 'On Time',
              data: stageProgressData.map(s => s.onTimeCount),
              backgroundColor: 'rgba(96, 165, 250, 0.9)', // blue-400
              borderColor: 'rgb(96, 165, 250)',
              borderWidth: 1,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
            {
              label: 'Early Start',
              data: stageProgressData.map(s => s.earlyStartCount),
              backgroundColor: 'rgba(192, 132, 252, 0.9)', // purple-400
              borderColor: 'rgb(192, 132, 252)',
              borderWidth: 1,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
            {
              label: 'Delayed',
              data: stageProgressData.map(s => s.delayedCount),
              backgroundColor: 'rgba(250, 204, 21, 0.9)', // yellow-400
              borderColor: 'rgb(250, 204, 21)',
              borderWidth: 1,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
            {
              label: 'Critically Delayed',
              data: stageProgressData.map(s => s.criticallyDelayedCount),
              backgroundColor: 'rgba(248, 113, 113, 0.9)', // red-400
              borderColor: 'rgb(248, 113, 113)',
              borderWidth: 1,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
            {
              label: 'Yet to Start',
              data: stageProgressData.map(s => s.yetToStartCount),
              backgroundColor: 'rgba(203, 213, 225, 0.9)', // slate-300
              borderColor: 'rgb(203, 213, 225)',
              borderWidth: 1,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animations: {
            tension: {
              duration: 1000,
              easing: 'linear',
              from: 0.8,
              to: 0.2,
              loop: false
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false,
              },
              title: {
                display: true,
                text: 'Project Stages',
                font: {
                  weight: 'bold'
                }
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                lineWidth: 1
              },
              border: {
                dash: [4, 4]
              },
              title: {
                display: true,
                text: 'Number of Tasks',
                font: {
                  weight: 'bold'
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 15,
                boxWidth: 8,
                boxHeight: 8,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 13
              },
              bodyFont: {
                size: 12
              },
              padding: 12,
              cornerRadius: 8,
              usePointStyle: true,
              callbacks: {
                footer: (tooltipItems: any) => {
                  const stageIndex = tooltipItems[0].dataIndex;
                  const stage = stageProgressData[stageIndex];
                  return `Overall Progress: ${stage.progress}%`;
                }
              }
            }
          }
        }}
      />
    );
  };

  // Modify the product task status chart to show all products in a single stacked bar chart
  const renderProductTaskStatusChart = () => {
    if (productProgressData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No product data available</p>
        </div>
      );
    }

    return (
      <Bar
        data={{
          labels: productProgressData.map(p => p.productName),
          datasets: [
            {
              label: 'Early Finish',
              data: productProgressData.map(p => p.earlyFinishCount),
              backgroundColor: '#4ade80', // green
              borderColor: '#4ade80',
              borderWidth: 1,
            },
            {
              label: 'Completed',
              data: productProgressData.map(p => p.completedTasks - p.earlyFinishCount),
              backgroundColor: '#10b981', // green-600
              borderColor: '#10b981',
              borderWidth: 1,
            },
            {
              label: 'Before Time',
              data: productProgressData.map(p => p.beforeTimeCount),
              backgroundColor: '#a3e635', // lime-400
              borderColor: '#a3e635',
              borderWidth: 1,
            },
            {
              label: 'On Time',
              data: productProgressData.map(p => p.onTimeCount),
              backgroundColor: '#60a5fa', // blue-400
              borderColor: '#60a5fa',
              borderWidth: 1,
            },
            {
              label: 'Early Start',
              data: productProgressData.map(p => p.earlyStartCount),
              backgroundColor: '#c084fc', // purple-400
              borderColor: '#c084fc',
              borderWidth: 1,
            },
            {
              label: 'Delayed',
              data: productProgressData.map(p => p.delayedCount),
              backgroundColor: '#facc15', // yellow-400
              borderColor: '#facc15',
              borderWidth: 1,
            },
            {
              label: 'Critically Delayed',
              data: productProgressData.map(p => p.criticallyDelayedCount),
              backgroundColor: '#f87171', // red-400
              borderColor: '#f87171',
              borderWidth: 1,
            },
            {
              label: 'Yet to Start',
              data: productProgressData.map(p => p.yetToStartCount),
              backgroundColor: '#cbd5e1', // slate-300
              borderColor: '#cbd5e1',
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: 'Products'
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Tasks'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                footer: (tooltipItems) => {
                  const index = tooltipItems[0].dataIndex;
                  const product = productProgressData[index];
                  return `Overall Progress: ${product.progress}%`;
                }
              }
            }
          }
        }}
      />
    );
  };

  return (
    <Tabs defaultValue="stages" className="w-full space-y-6 animate-in fade-in duration-500">
      <TabsList className="grid w-full grid-cols-5 bg-gray-100/80 p-1 rounded-xl shadow-sm">
        <TabsTrigger value="stages" className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">Stages</TabsTrigger>
        <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">Products</TabsTrigger>
        <TabsTrigger value="stagesByProduct" className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">Stages by Product</TabsTrigger>
        <TabsTrigger value="financial" className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">Financial</TabsTrigger>
        <TabsTrigger value="delays" className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200">Delays</TabsTrigger>
      </TabsList>

      <TabsContent value="stages" className="mt-6 space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm border-gray-200/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-gray-800">Stage-wise Progress Overview</CardTitle>
              <CardDescription className="text-gray-500">Progress percentage across project stages</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {stageProgressData.length > 0 ? (
                <Bar
                  data={{
                    labels: stageProgressData.map(s => s.stageName),
                    datasets: [
                      {
                        label: 'Progress (%)',
                        data: stageProgressData.map(s => s.progress),
                        backgroundColor: stageProgressData.map(s => s.color),
                        borderColor: stageProgressData.map(s => s.color),
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animations: {
                      tension: {
                        duration: 1000,
                        easing: 'linear',
                        from: 0.8,
                        to: 0.2,
                        loop: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                          lineWidth: 1
                        },
                        border: {
                          dash: [4, 4]
                        },
                        title: {
                          display: true,
                          text: 'Progress (%)',
                          font: {
                            weight: 'bold'
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        title: {
                          display: true,
                          text: 'Project Stages',
                          font: {
                            weight: 'bold'
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        labels: {
                          usePointStyle: true,
                          boxWidth: 6,
                          boxHeight: 6
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                          size: 14
                        },
                        bodyFont: {
                          size: 13
                        },
                        padding: 12,
                        cornerRadius: 8,
                        usePointStyle: true
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <p className="text-gray-500 font-medium">No stage data available</p>
                  <p className="text-gray-400 text-sm mt-1">Stage data will appear once tasks are added to stages</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm border-gray-200/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-gray-800">Task Status by Stage</CardTitle>
              <CardDescription className="text-gray-500">Distribution of tasks by status for each stage</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {renderStageProgressCharts()}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="products" className="mt-6 space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Product-wise Completion</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {productProgressData.length > 0 ? (
                <Doughnut
                  data={{
                    labels: productProgressData.map(p => p.productName),
                    datasets: [
                      {
                        label: 'Progress (%)',
                        data: productProgressData.map(p => p.progress),
                        backgroundColor: [
                          '#f87171', '#60a5fa', '#4ade80', '#facc15', 
                          '#a78bfa', '#fb923c', '#c084fc'
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context: any) {
                            const index = context.dataIndex;
                            const product = productProgressData[index];
                            return [
                              `Progress: ${product.progress}%`,
                              `Completed: ${product.completedTasks} / ${product.totalTasks}`
                            ];
                          }
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No product data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Status by Product</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {renderProductTaskStatusChart()}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Progress</CardTitle>
              <CardDescription>Progress of each product in the project</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="border border-gray-200/80 px-4 py-3 text-left font-medium text-gray-700">Product</th>
                      <th className="border border-gray-200/80 px-4 py-3 text-right font-medium text-gray-700">Total Tasks</th>
                      <th className="border border-gray-200/80 px-4 py-3 text-right font-medium text-gray-700">Completed</th>
                      <th className="border border-gray-200/80 px-4 py-3 text-right font-medium text-gray-700">In Progress</th>
                      <th className="border border-gray-200/80 px-4 py-3 text-center font-medium text-gray-700">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productProgressData.map((product, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} transition-colors hover:bg-blue-50/30`}>
                        <td className="border border-gray-200/80 px-4 py-3 font-medium">{product.productName}</td>
                        <td className="border border-gray-200/80 px-4 py-3 text-right">{product.totalTasks}</td>
                        <td className="border border-gray-200/80 px-4 py-3 text-right">{product.completedTasks}</td>
                        <td className="border border-gray-200/80 px-4 py-3 text-right">{product.inProgressTasks}</td>
                        <td className="border border-gray-200/80 px-4 py-3 text-center">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  product.progress === 100 ? 'bg-green-600' : 
                                  product.progress > 70 ? 'bg-lime-500' :
                                  product.progress > 40 ? 'bg-blue-500' :
                                  product.progress > 0 ? 'bg-orange-500' :
                                  'bg-gray-500'
                                } transition-all duration-500 ease-in-out`}
                                style={{ width: `${product.progress}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 font-medium">{product.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Product Go-Live Schedule</CardTitle>
              <CardDescription>Planned and estimated go-live dates by product</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2 text-left">Product</th>
                      <th className="border px-4 py-2 text-right">Delay (days)</th>
                      <th className="border px-4 py-2 text-right">Planned Go-Live Date</th>
                      <th className="border px-4 py-2 text-right">Estimated Go-Live Date</th>
                      <th className="border px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productGoLiveData.map((data, index) => {
                      // Calculate status based on delay
                      let statusText = 'On Track';
                      let statusClass = 'bg-green-100 text-green-800';
                      
                      if (data.delay === 0) {
                        statusText = 'On Track';
                        statusClass = 'bg-green-100 text-green-800';
                      } else if (data.delay <= 5) {
                        statusText = 'Slight Delay';
                        statusClass = 'bg-yellow-100 text-yellow-800';
                      } else if (data.delay <= 15) {
                        statusText = 'Moderate Delay';
                        statusClass = 'bg-orange-100 text-orange-800';
                      } else {
                        statusText = 'Significant Delay';
                        statusClass = 'bg-red-100 text-red-800';
                      }
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border px-4 py-2">{data.productName}</td>
                          <td className={`border px-4 py-2 text-right ${data.delay > 0 ? 'text-red-600 font-medium' : ''}`}>
                            {data.delay > 0 ? data.delay : '-'}
                          </td>
                          <td className="border px-4 py-2 text-right">
                            {data.plannedGoLiveDate ? data.plannedGoLiveDate.toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={`border px-4 py-2 text-right ${data.delay > 0 ? 'text-red-600' : ''}`}>
                            {data.estimatedGoLiveDate ? data.estimatedGoLiveDate.toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${statusClass}`}>
                              {data.delay === 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                              ) : data.delay > 15 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                              )}
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="stagesByProduct" className="mt-6 space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div className="grid gap-6 mb-6">
          {productStageProgressData.map((product, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{product.productName} - Stage Progress</CardTitle>
                <CardDescription>Stage-wise progress for {product.productName}</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <Bar
                  data={{
                    labels: product.stageProgress.map(s => s.stageName),
                    datasets: [
                      {
                        label: 'Progress (%)',
                        data: product.stageProgress.map(s => s.progress),
                        backgroundColor: product.stageProgress.map(s => s.color),
                        borderColor: product.stageProgress.map(s => s.color),
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Progress (%)',
                          font: {
                            weight: 'bold'
                          }
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Project Stages',
                          font: {
                            weight: 'bold'
                          }
                        }
                      }
                    },
                  }}
                />
              </CardContent>
            </Card>
          ))}

          {productStageProgressData.map((product, productIndex) => (
            <Card key={`table-${productIndex}`}>
              <CardHeader>
                <CardTitle>{product.productName} - Stage Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left">Stage</th>
                        <th className="border px-4 py-2 text-right">Total Tasks</th>
                        <th className="border px-4 py-2 text-right">Completed</th>
                        <th className="border px-4 py-2 text-right">In Progress</th>
                        <th className="border px-4 py-2 text-right">Delayed</th>
                        <th className="border px-4 py-2 text-center">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.stageProgress.map((stage, stageIndex) => (
                        <tr key={stageIndex} className={stageIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border px-4 py-2">{stage.stageName}</td>
                          <td className="border px-4 py-2 text-right">{stage.taskCount}</td>
                          <td className="border px-4 py-2 text-right">{stage.completedCount}</td>
                          <td className="border px-4 py-2 text-right">{stage.inProgressCount}</td>
                          <td className="border px-4 py-2 text-right">{stage.delayedCount}</td>
                          <td className="border px-4 py-2 text-center">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    stage.progress === 100 ? 'bg-green-600' : 
                                    stage.progress > 70 ? 'bg-lime-500' :
                                    stage.progress > 40 ? 'bg-blue-500' :
                                    stage.progress > 0 ? 'bg-orange-500' :
                                    'bg-gray-500'
                                  }`}
                                  style={{ width: `${stage.progress}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">{stage.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="financial" className="mt-6 space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 shadow-md border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-30"></div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path>
                  <line x1="12" y1="3" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="21"></line>
                </svg>
                Total Project Value
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-gray-900">₹{(totalFinancialValue).toLocaleString()}</div>
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Total value across all financial milestones
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm border-gray-200/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-gray-800">Invoice Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(totalInvoiceRaised).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalInvoiceRaised / totalFinancialValue) * 100).toFixed(1)}% of total project value
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm border-gray-200/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-gray-800">Amount Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(totalReceivedValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalReceivedValue / totalInvoiceRaised) * 100).toFixed(1)}% of invoiced amount
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Payment Status</CardTitle>
              <CardDescription>Financial distribution by milestone</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {financialMilestones.length > 0 ? (
                <Bar
                  data={{
                    labels: financialMilestones.map(m => m.milestoneName),
                    datasets: [
                      {
                        label: 'Amount Received',
                        data: financialMilestones.map(m => m.received),
                        backgroundColor: '#22c55e', // green
                        stack: 'Stack 0',
                      },
                      {
                        label: 'Invoice Raised (Not Received)',
                        data: financialMilestones.map(m => m.invoiceRaised - m.received),
                        backgroundColor: '#eab308', // yellow
                        stack: 'Stack 0',
                      },
                      {
                        label: 'Unraised Invoice',
                        data: financialMilestones.map(m => m.value - m.invoiceRaised),
                        backgroundColor: '#d1d5db', // gray
                        stack: 'Stack 0',
                      }
                    ],
                  }}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: true,
                        title: {
                          display: true,
                          text: 'Amount (₹)'
                        },
                        ticks: {
                          callback: function(value) {
                            return '₹' + Number(value).toLocaleString();
                          }
                        }
                      },
                      y: {
                        stacked: true,
                        title: {
                          display: true,
                          text: 'Milestone'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.raw as number;
                            const label = context.dataset.label || '';
                            return `${label}: ₹${value.toLocaleString()}`;
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No financial milestone data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Project financial status</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {financialMilestones.length > 0 ? (
                <div className="h-full flex flex-col justify-center">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-semibold">₹{(totalFinancialValue - totalInvoiceRaised).toLocaleString()}</div>
                      <div className="text-xs text-center text-gray-500 mt-1">Unraised Invoice</div>
                      <div className="mt-2 h-3 w-full rounded-full bg-gray-200">
                        <div 
                          className="h-3 rounded-full bg-gray-400" 
                          style={{ width: `${((totalFinancialValue - totalInvoiceRaised) / totalFinancialValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-semibold">₹{(totalInvoiceRaised - totalReceivedValue).toLocaleString()}</div>
                      <div className="text-xs text-center text-gray-500 mt-1">Invoice Raised</div>
                      <div className="mt-2 h-3 w-full rounded-full bg-gray-200">
                        <div 
                          className="h-3 rounded-full bg-yellow-500" 
                          style={{ width: `${((totalInvoiceRaised - totalReceivedValue) / totalFinancialValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-semibold">₹{totalReceivedValue.toLocaleString()}</div>
                      <div className="text-xs text-center text-gray-500 mt-1">Amount Received</div>
                      <div className="mt-2 h-3 w-full rounded-full bg-gray-200">
                        <div 
                          className="h-3 rounded-full bg-green-500" 
                          style={{ width: `${(totalReceivedValue / totalFinancialValue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Doughnut
                      data={{
                        labels: ['Amount Received', 'Invoice Raised (Not Received)', 'Unraised Invoice'],
                        datasets: [
                          {
                            data: [
                              totalReceivedValue,
                              totalInvoiceRaised - totalReceivedValue,
                              totalFinancialValue - totalInvoiceRaised
                            ],
                            backgroundColor: [
                              '#22c55e', // green
                              '#eab308', // yellow
                              '#d1d5db', // gray
                            ],
                            borderColor: [
                              '#16a34a',
                              '#ca8a04',
                              '#9ca3af'
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.raw as number;
                                const total = totalFinancialValue;
                                const percentage = Math.round((value / total) * 100);
                                return `₹${value.toLocaleString()} (${percentage}%)`;
                              }
                            }
                          }
                        },
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No financial milestone data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Financial Milestones Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {financialMilestones.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-md overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-700">PO No.</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Milestone</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Due Date</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Total Value</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Invoice Raised</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Amount Received</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Progress</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialMilestones.map((milestone, index) => {
                      // Determine status text and style
                      let statusText = '';
                      let statusClass = '';
                      let statusIcon = null;
                      
                      if (milestone.progress === 100) {
                        if (milestone.received === milestone.value) {
                          statusText = 'Completed';
                          statusClass = 'bg-green-100 text-green-800';
                          statusIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 mr-1">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          );
                        } else if (milestone.invoiceRaised === milestone.value) {
                          statusText = 'Awaiting Payment';
                          statusClass = 'bg-yellow-100 text-yellow-800';
                          statusIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 mr-1">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="6" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                          );
                        } else {
                          statusText = 'Invoice Pending';
                          statusClass = 'bg-orange-100 text-orange-800';
                          statusIcon = (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 mr-1">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          );
                        }
                      } else {
                        if (milestone.progress === 0) {
                          statusText = 'Not Started';
                          statusClass = 'bg-gray-100 text-gray-800';
                        } else if (milestone.progress < 50) {
                          statusText = 'In Progress';
                          statusClass = 'bg-blue-100 text-blue-800';
                        } else {
                          statusText = 'Nearing Completion';
                          statusClass = 'bg-purple-100 text-purple-800';
                        }
                      }
                      
                      return (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} transition-colors hover:bg-blue-50/30`}>
                          <td className="px-4 py-3 font-medium text-gray-700">{milestone.poNumber}</td>
                          <td className="px-4 py-3">{milestone.milestoneName}</td>
                          <td className="px-4 py-3 text-right">
                            {milestone.dueDate ? 
                              <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-1">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                {new Date(milestone.dueDate).toLocaleDateString()}
                              </span> : 'N/A'
                            }
                          </td>
                          <td className="px-4 py-3 text-right font-medium">₹{milestone.value.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">₹{milestone.invoiceRaised.toLocaleString()} 
                            <span className="text-xs text-gray-500 ml-1">
                              ({Math.round((milestone.invoiceRaised / milestone.value) * 100)}%)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">₹{milestone.received.toLocaleString()}
                            <span className="text-xs text-gray-500 ml-1">
                              ({milestone.invoiceRaised ? Math.round((milestone.received / milestone.invoiceRaised) * 100) : 0}%)
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    milestone.progress === 100 ? 'bg-green-600' : 
                                    milestone.progress > 70 ? 'bg-lime-500' :
                                    milestone.progress > 40 ? 'bg-blue-500' :
                                    milestone.progress > 0 ? 'bg-orange-500' :
                                    'bg-gray-500'
                                  } transition-all duration-500 ease-in-out`}
                                  style={{ width: `${milestone.progress}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">{milestone.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${statusClass}`}>
                              {statusIcon}
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-medium border-t-2 border-gray-300">
                      <td className="px-4 py-3" colSpan={3}>Total</td>
                      <td className="px-4 py-3 text-right">₹{totalFinancialValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">₹{totalInvoiceRaised.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">₹{totalReceivedValue.toLocaleString()}</td>
                      <td className="px-4 py-3" colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-4 text-center text-gray-500">
                No financial milestone data available
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="delays" className="mt-6 space-y-6 animate-in slide-in-from-left-4 duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border border-gray-200/70 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Delay Distribution
              </CardTitle>
              <CardDescription className="text-gray-500">Analysis of task delays by duration</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              {delayBucketData.length > 0 && delayBucketData.some(bucket => bucket.count > 0) ? (
                <Pie
                  data={{
                    labels: delayBucketData.map(bucket => `${bucket.bucket} (${bucket.count})`),
                    datasets: [
                      {
                        data: delayBucketData.map(bucket => bucket.count),
                        backgroundColor: [
                          '#fde68a', // 1-5 days - light yellow
                          '#fbbf24', // 6-10 days - yellow
                          '#ea580c', // 11-20 days - orange
                          '#dc2626', // 20+ days - red
                        ],
                        borderColor: [
                          '#f59e0b',
                          '#d97706',
                          '#c2410c',
                          '#b91c1c',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context: any) {
                            const index = context.dataIndex;
                            const bucket = delayBucketData[index];
                            return `${bucket.count} tasks (${Math.round(bucket.count / delayBucketData.reduce((sum, b) => sum + b.count, 0) * 100)}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No delayed tasks found</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks by Delay Bucket</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-80 overflow-auto">
              {delayBucketData.length > 0 && delayBucketData.some(bucket => bucket.count > 0) ? (
                <div className="space-y-4 p-4">
                  {delayBucketData.map((bucket, bucketIndex) => (
                    <div key={bucketIndex} className={bucket.count === 0 ? 'hidden' : ''}>
                      <h3 className="font-medium text-sm mb-2 flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          bucketIndex === 0 ? 'bg-yellow-200' : 
                          bucketIndex === 1 ? 'bg-yellow-400' : 
                          bucketIndex === 2 ? 'bg-orange-500' : 
                          'bg-red-600'
                        }`}></span>
                        {bucket.bucket} ({bucket.count} tasks)
                      </h3>
                      
                      {bucket.tasks.length > 0 ? (
                        <div className="bg-gray-50 rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-left">Task</th>
                                <th className="px-3 py-2 text-right">Delay (days)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bucket.tasks.map((task, taskIndex) => (
                                <tr key={taskIndex} className={taskIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-3 py-2 truncate max-w-xs">{task.name}</td>
                                  <td className="px-3 py-2 text-right font-medium text-red-600">{task.delay}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No tasks in this bucket</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No delayed tasks found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Delay Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {delayBucketData.length > 0 && delayBucketData.some(bucket => bucket.count > 0) ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Delay Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {delayBucketData.map((bucket, index) => (
                      <div key={index} className="bg-white p-4 border rounded-lg shadow-sm">
                        <div className="text-lg font-semibold">{bucket.bucket}</div>
                        <div className="text-3xl font-bold mt-1">{bucket.count}</div>
                        <div className="text-sm text-gray-500 mt-1">tasks</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Delay Distribution by Category</h3>
                  <Bar
                    data={{
                      labels: ['1-5 days', '6-10 days', '11-20 days', '20+ days'],
                      datasets: [
                        {
                          label: 'Number of Tasks',
                          data: delayBucketData.map(bucket => bucket.count),
                          backgroundColor: ['#fde68a', '#fbbf24', '#ea580c', '#dc2626'],
                          borderColor: ['#f59e0b', '#d97706', '#c2410c', '#b91c1c'],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Tasks'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Delay Range'
                          }
                        }
                      },
                    }}
                    height={200}
                  />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p className="text-lg">Good news! No delayed tasks found.</p>
                <p className="text-sm mt-2">All tasks are currently on schedule.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardCharts; 