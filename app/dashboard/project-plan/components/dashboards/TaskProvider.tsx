'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Task, STAGES, PRODUCTS } from '@/types/task';

// Create dummy realistic project data
const generateDummyTasks = (): Task[] => {
  const today = new Date();
  const tasks: Task[] = [];
  let siNo = 1;
  
  // Financial data for milestones
  const totalProjectValue = 2500000; // $2.5M project
  const milestoneValues: Record<string, number> = {};
  let allocatedAmount = 0;

  // Distribute financial values to stages (more for critical stages)
  STAGES.forEach((stage, index) => {
    // More money for key phases like Design, Development, UAT
    let percentage = 0;
    if (index === 0) percentage = 0.05; // Initiation - 5%
    else if (index === 1) percentage = 0.10; // Requirements - 10%
    else if (index === 2) percentage = 0.20; // Design - 20%
    else if (index === 3) percentage = 0.25; // Development - 25%
    else if (index === 4) percentage = 0.15; // Testing - 15%
    else if (index === 5) percentage = 0.05; // Training - 5%
    else if (index === 6) percentage = 0.10; // UAT - 10%
    else if (index === 7) percentage = 0.05; // Deployment - 5%
    else if (index >= 8) percentage = 0.05 / (STAGES.length - 8); // Remaining stages

    milestoneValues[stage.id] = Math.round(totalProjectValue * percentage);
    allocatedAmount += milestoneValues[stage.id];
  });

  // Adjust final stage to ensure total adds up to project value
  if (STAGES.length > 0) {
    const finalStage = STAGES[STAGES.length - 1];
    milestoneValues[finalStage.id] += (totalProjectValue - allocatedAmount);
  }

  // Helper function to determine schedule percentage for a task
  const estimateSchedulePercentage = (
    startDate: Date,
    endDate: Date,
    statusType: string
  ): number => {
    const totalDuration = endDate.getTime() - startDate.getTime();
    let elapsedPercentage = 0;
    
    switch (statusType) {
      case 'early-finish':
        elapsedPercentage = Math.random() * 70 + 20; // 20-90%
        break;
      case 'completed':
        elapsedPercentage = 100;
        break;
      case 'early-start':
        elapsedPercentage = 0;
        break;
      case 'delayed':
        elapsedPercentage = Math.random() * 30 + 70; // 70-100%
        break;
      case 'before-time':
        elapsedPercentage = Math.random() * 60 + 20; // 20-80%
        break;
      case 'on-time':
        elapsedPercentage = Math.random() * 70 + 15; // 15-85%
        break;
      case 'critically-delayed':
        elapsedPercentage = 100;
        break;
      case 'yet-to-start':
        elapsedPercentage = 0;
        break;
      default:
        elapsedPercentage = Math.random() * 100;
    }
    
    return elapsedPercentage;
  };

  // Helper function to set task progress based on desired status
  const calculateStatusMetrics = (
    task: Partial<Task>,
    statusType: string
  ): Partial<Task> => {
    // Make sure dates exist
    if (!task.startDate || !task.endDate) return task;
    
    const schedulePercentage = estimateSchedulePercentage(
      task.startDate,
      task.endDate,
      statusType
    );
    
    const result = { ...task };
    
    switch (statusType) {
      case 'early-finish':
        // Completed before schedule
        result.progress = 100;
        result.actualStartDate = new Date(task.startDate);
        result.actualEndDate = new Date(
          task.startDate.getTime() + 
          (task.endDate.getTime() - task.startDate.getTime()) * (schedulePercentage / 100)
        );
        result.actualDuration = Math.floor(
          (result.actualEndDate.getTime() - result.actualStartDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        break;
        
      case 'completed':
        // Completed on schedule
        result.progress = 100;
        result.actualStartDate = new Date(task.startDate);
        result.actualEndDate = new Date(task.endDate);
        result.actualDuration = task.duration;
        break;
        
      case 'early-start':
        // Started but barely any progress, early in schedule
        result.progress = Math.random() * 20 + 5; // 5-25%
        result.actualStartDate = new Date(task.startDate);
        result.actualEndDate = null;
        result.actualDuration = null;
        break;
        
      case 'delayed':
        // Behind schedule
        result.progress = Math.random() * 40 + 5; // 5-45%
        result.actualStartDate = new Date(task.startDate);
        result.actualEndDate = null;
        result.actualDuration = null;
        break;
        
      case 'before-time':
        // Ahead of schedule
        result.progress = Math.random() * 20 + schedulePercentage + 10; // 10-30% ahead of schedule
        if (result.progress > 95) result.progress = 95; // Cap at 95%
        result.actualStartDate = new Date(task.startDate);
        result.actualEndDate = null;
        result.actualDuration = null;
        break;
        
      case 'on-time':
        // On schedule
        result.progress = schedulePercentage - (Math.random() * 10); // Slightly behind or at schedule
        if (result.progress < 0) result.progress = 0;
        result.actualStartDate = new Date(task.startDate);
        result.actualEndDate = null;
        result.actualDuration = null;
        break;
        
      case 'critically-delayed':
        // At schedule end but not complete
        result.progress = Math.random() * 50 + 30; // 30-80%
        result.actualStartDate = new Date(task.startDate);
        result.actualEndDate = null;
        result.actualDuration = null;
        result.delayDays = Math.floor(Math.random() * 15) + 10; // 10-25 days delay
        break;
        
      case 'yet-to-start':
        // Not started yet
        result.progress = 0;
        result.actualStartDate = null;
        result.actualEndDate = null;
        result.actualDuration = null;
        break;
    }
    
    return result;
  };

  // Define status distributions for each product to ensure balanced distribution
  // This ensures that each product has a comprehensive mix of statuses for better visualization
  const productStatusDistributions: Record<string, Record<string, number>> = {};
  
  // Initialize with default distributions for each product
  PRODUCTS.forEach(product => {
    productStatusDistributions[product.id] = {
      'early-finish': 0,
      'completed': 0,
      'early-start': 0,
      'delayed': 0,
      'before-time': 0, 
      'on-time': 0,
      'critically-delayed': 0,
      'yet-to-start': 0
    };
  });

  // Special array for Go-Live tasks to ensure we have a good distribution
  const goLiveTasks: Task[] = [];
  
  // Create level 0 tasks (milestones) for each stage
  STAGES.forEach((stage, stageIndex) => {
    // Some stages might have multiple level 0 tasks
    const numMilestones = stageIndex === 3 || stageIndex === 5 ? 2 : 1;
    
    // Split milestone value between multiple milestones if needed
    const stageValue = milestoneValues[stage.id];
    const milestoneValue = Math.round(stageValue / numMilestones);
    
    for (let m = 0; m < numMilestones; m++) {
      // Calculate dates with some milestones being delayed
      const isDelayed = stageIndex > 1 && stageIndex < 5 && Math.random() > 0.7;
      const delayDays = isDelayed ? Math.floor(Math.random() * 15) + 1 : 0;
      
      const startDate = new Date();
      startDate.setDate(today.getDate() - 30 + (stageIndex * 20));
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 15 + delayDays);
      
      const plannedEndDate = new Date(startDate);
      plannedEndDate.setDate(startDate.getDate() + 15);
      
      // Determine milestone status based on stage
      let milestoneStatus = 'on-time';
      if (stageIndex === 0) milestoneStatus = 'completed';
      else if (stageIndex === 1) milestoneStatus = stageIndex === 1 && m === 0 ? 'early-finish' : 'completed';
      else if (stageIndex === 2) milestoneStatus = 'before-time';
      else if (stageIndex === 3) milestoneStatus = 'delayed';
      else if (stageIndex === 4) milestoneStatus = 'critically-delayed';
      else milestoneStatus = 'yet-to-start';
      
      // Create Go-Live indicators for final stages - ensure rich dummy data for dashboard
      const isGoLive = stageIndex === STAGES.length - 1 || (stageIndex === STAGES.length - 2 && m === numMilestones - 1);
      
      // Determine realistic financial value for milestone
      // Early milestones are likely to have invoices raised and payments received
      let invoiceProgress = 0;
      let paymentProgress = 0;
      
      if (stageIndex < 2) {
        // Early stages - fully invoiced and paid
        invoiceProgress = 1.0;
        paymentProgress = 1.0;
      } else if (stageIndex < 4) {
        // Middle stages - fully invoiced but partially paid
        invoiceProgress = 1.0;
        paymentProgress = 0.7 + (Math.random() * 0.3);
      } else if (stageIndex < 6) {
        // Later middle stages - partially invoiced
        invoiceProgress = 0.5 + (Math.random() * 0.5);
        paymentProgress = 0.6 + (Math.random() * 0.4);
      } else if (stageIndex < 8) {
        // Later stages - some invoices raised if progress is good
        invoiceProgress = Math.random() > 0.5 ? 0.3 + (Math.random() * 0.3) : 0;
        paymentProgress = Math.random() > 0.6 ? 0.8 : 0;
      } else {
        // Final stages - likely no invoices yet
        invoiceProgress = 0;
        paymentProgress = 0;
      }
      
      let milestone: Task = {
        id: `task-${siNo}`,
        siNo: siNo++,
        wbsNo: `${stageIndex + 1}`,
        taskName: `${stage.name} ${numMilestones > 1 ? (m + 1) : ''}`,
        level: 0,
        predecessorIds: stageIndex > 0 ? `${siNo - 2}` : null,
        startDate: startDate,
        endDate: isDelayed ? endDate : plannedEndDate,
        duration: isDelayed ? 15 + delayDays : 15,
        actualStartDate: null,
        actualEndDate: null,
        actualDuration: null,
        progress: 0,
        goLive: isGoLive,
        financialMilestone: stageIndex === 2 || stageIndex === 5 || stageIndex === 7 || stageIndex === 0,
        remarks: [],
        view: 'External',
        createdAt: new Date(),
        updatedAt: new Date(),
        stageId: stage.id,
        isParent: true,
        isDeleted: false,
        financialValue: stageIndex === 2 || stageIndex === 5 || stageIndex === 7 || stageIndex === 0 ? milestoneValue : 0,
        plannedEndDate: plannedEndDate,
        delayDays: isDelayed ? delayDays : 0
      };
      
      // Apply task status
      milestone = calculateStatusMetrics(milestone, milestoneStatus) as Task;
      tasks.push(milestone);
      
      // If it's a go-live milestone, add it to our special go-live array
      if (isGoLive) {
        goLiveTasks.push(milestone);
      }
      
      // Add 3-6 subtasks for each milestone
      const numSubtasks = 3 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numSubtasks; i++) {
        // Get all products and make sure each has a good variety of statuses
        const productIndex = (stageIndex * numMilestones + i) % PRODUCTS.length;
        const productId = PRODUCTS[productIndex].id;
        
        // Assign a status to each subtask with a distribution that ensures coverage
        const statusTypes = [
          'early-finish', 'completed', 'early-start', 'delayed', 
          'before-time', 'on-time', 'critically-delayed', 'yet-to-start'
        ];
        
        // Find the status with the lowest count for this product to ensure even distribution
        const statusCounts = productStatusDistributions[productId];
        let chosenStatus = statusTypes[0];
        let minCount = Number.MAX_SAFE_INTEGER;
        
        // Find status with lowest count for this product
        for (const [status, count] of Object.entries(statusCounts)) {
          if (count < minCount) {
            minCount = count;
            chosenStatus = status;
          }
        }
        
        // Every 8th task, override with a specific status to ensure visual variety
        if ((tasks.length % 8) === 0) {
          const specificStatusIndex = tasks.length % statusTypes.length;
          chosenStatus = statusTypes[specificStatusIndex];
        }
        
        // Update the status count for this product
        productStatusDistributions[productId][chosenStatus] += 1;
        
        // Specific product and stage combinations get specific statuses for visual effect
        if (stageIndex === 0 && productIndex === 0) chosenStatus = 'completed';
        if (stageIndex === 1 && productIndex === 1) chosenStatus = 'early-finish';
        if (stageIndex === 2 && productIndex === 2) chosenStatus = 'before-time';
        if (stageIndex === 3 && productIndex === 3) chosenStatus = 'on-time';
        if (stageIndex === 3 && productIndex === 0) chosenStatus = 'early-start';
        if (stageIndex === 4 && productIndex === 1) chosenStatus = 'delayed';
        if (stageIndex === 4 && productIndex === 2) chosenStatus = 'critically-delayed';
        if (stageIndex === 5 && productIndex === 3) chosenStatus = 'yet-to-start';
        
        // Some subtasks might be delayed
        const isSubtaskDelayed = chosenStatus === 'delayed' || chosenStatus === 'critically-delayed';
        const subTaskDelayDays = isSubtaskDelayed ? Math.floor(Math.random() * 10) + 1 : 0;
        
        const subTaskStartDate = new Date(startDate);
        subTaskStartDate.setDate(startDate.getDate() + (i * 3));
        
        const subTaskEndDate = new Date(subTaskStartDate);
        subTaskEndDate.setDate(subTaskStartDate.getDate() + 2 + subTaskDelayDays);
        
        const subTaskPlannedEndDate = new Date(subTaskStartDate);
        subTaskPlannedEndDate.setDate(subTaskStartDate.getDate() + 2);
        
        // For go-live tasks, we use a more deterministic approach to ensure good dashboard data
        const isGoLiveSubtask = stageIndex >= STAGES.length - 3 && i % 3 === 0;
        
        let subtask: Task = {
          id: `task-${siNo}`,
          siNo: siNo++,
          wbsNo: `${stageIndex + 1}.${i + 1}`,
          taskName: `${stage.name} Subtask ${i + 1}`,
          level: 1,
          predecessorIds: i > 0 ? `${siNo - 2}` : null,
          startDate: subTaskStartDate,
          endDate: isSubtaskDelayed ? subTaskEndDate : subTaskPlannedEndDate,
          duration: isSubtaskDelayed ? 3 + subTaskDelayDays : 3,
          actualStartDate: null,
          actualEndDate: null,
          actualDuration: null,
          progress: 0,
          goLive: isGoLiveSubtask,
          financialMilestone: false,
          remarks: [],
          view: 'External',
          createdAt: new Date(),
          updatedAt: new Date(),
          stageId: stage.id,
          productId: productId,
          isParent: false,
          isDeleted: false,
          financialValue: 0,
          plannedEndDate: subTaskPlannedEndDate,
          delayDays: isSubtaskDelayed ? subTaskDelayDays : 0
        };
        
        // Apply task status
        subtask = calculateStatusMetrics(subtask, chosenStatus) as Task;
        tasks.push(subtask);
        
        // If it's a go-live task, add it to our special go-live array
        if (isGoLiveSubtask) {
          goLiveTasks.push(subtask);
        }
        
        // For some subtasks, add detailed work items (level 2)
        if (Math.random() > 0.6) {
          const numWorkItems = 1 + Math.floor(Math.random() * 3);
          
          for (let j = 0; j < numWorkItems; j++) {
            // Alternate product assignment for work items to ensure all products get coverage
            const workItemProductIndex = (productIndex + j) % PRODUCTS.length;
            const workItemProductId = PRODUCTS[workItemProductIndex].id;
            
            // Inherit status from parent subtask but with some variation
            let workItemStatus = chosenStatus;
            if (j > 0 && Math.random() > 0.5) {
              // Find next status with lowest count for this product
              let minWorkItemCount = Number.MAX_SAFE_INTEGER;
              for (const [status, count] of Object.entries(productStatusDistributions[workItemProductId])) {
                if (count < minWorkItemCount && status !== chosenStatus) {
                  minWorkItemCount = count;
                  workItemStatus = status;
                }
              }
            }
            
            // Update the status count for this product
            productStatusDistributions[workItemProductId][workItemStatus] += 1;
            
            // Some work items might be delayed
            const isWorkItemDelayed = workItemStatus === 'delayed' || workItemStatus === 'critically-delayed';
            const workItemDelayDays = isWorkItemDelayed ? Math.floor(Math.random() * 5) + 1 : 0;
            
            const workItemStartDate = new Date(subTaskStartDate);
            workItemStartDate.setDate(subTaskStartDate.getDate() + (j * 1));
            
            const workItemEndDate = new Date(workItemStartDate);
            workItemEndDate.setDate(workItemStartDate.getDate() + workItemDelayDays + 1);
            
            const workItemPlannedEndDate = new Date(workItemStartDate);
            workItemPlannedEndDate.setDate(workItemStartDate.getDate() + 1);
            
            let workItem: Task = {
              id: `task-${siNo}`,
              siNo: siNo++,
              wbsNo: `${stageIndex + 1}.${i + 1}.${j + 1}`,
              taskName: `Work Item ${j + 1}`,
              level: 2,
              predecessorIds: j > 0 ? `${siNo - 2}` : null,
              startDate: workItemStartDate,
              endDate: isWorkItemDelayed ? workItemEndDate : workItemPlannedEndDate,
              duration: isWorkItemDelayed ? 1 + workItemDelayDays : 1,
              actualStartDate: null,
              actualEndDate: null,
              actualDuration: null,
              progress: 0,
              goLive: false,
              financialMilestone: false,
              remarks: [],
              view: 'External',
              createdAt: new Date(),
              updatedAt: new Date(),
              stageId: stage.id,
              productId: workItemProductId,
              isParent: false,
              isDeleted: false,
              financialValue: 0,
              plannedEndDate: workItemPlannedEndDate,
              delayDays: isWorkItemDelayed ? workItemDelayDays : 0
            };
            
            // Apply task status
            workItem = calculateStatusMetrics(workItem, workItemStatus) as Task;
            tasks.push(workItem);
          }
        }
      }
    }
  });
  
  // Ensure we have a good variety of go-live tasks with different statuses
  const goLiveTaskStatuses = [
    { name: 'Early Finish', count: 0, target: 2 },
    { name: 'Completed', count: 0, target: 2 },
    { name: 'Before Time', count: 0, target: 2 },
    { name: 'On Time', count: 0, target: 2 },
    { name: 'Early Start', count: 0, target: 2 },
    { name: 'Delayed', count: 0, target: 2 },
    { name: 'Critically Delayed', count: 0, target: 1 },
    { name: 'Yet to Start', count: 0, target: 2 }
  ];

  // Helper function to set task properties based on desired status
  function setTaskForStatus(task: Task, status: string) {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Default to 14 days ago
    let startDate = new Date(now.getTime() - (14 * oneDay));
    // Default to 14 days in future
    let endDate = new Date(now.getTime() + (14 * oneDay));
    // Default to not started
    let progress = 0;
    // Default to no delay
    let delayDays = 0;
    // Default plannedEndDate is same as endDate
    let plannedEndDate = new Date(endDate);
    
    switch (status) {
      case 'Early Finish':
        // Started on time, finished early
        progress = 100;
        endDate = new Date(now.getTime() - (2 * oneDay)); // Finished 2 days ago
        plannedEndDate = new Date(now.getTime() + (5 * oneDay)); // Was planned to finish in 5 days
        break;
        
      case 'Completed':
        // Finished on time
        progress = 100;
        endDate = plannedEndDate; // End date matches planned end date
        break;
        
      case 'Before Time':
        // In progress, ahead of schedule
        progress = Math.floor(Math.random() * 30) + 60; // 60-90% complete
        // We're 70% through the time but 60-90% complete
        const timeElapsed = now.getTime() - startDate.getTime();
        const totalTime = plannedEndDate.getTime() - startDate.getTime();
        const schedulePercentage = (timeElapsed / totalTime) * 100;
        // Ensure schedulePercentage is less than progress
        if (schedulePercentage >= progress) {
          // Adjust startDate to ensure we're ahead of schedule
          const newTimeElapsed = (progress * 0.8 / 100) * totalTime;
          startDate = new Date(now.getTime() - newTimeElapsed);
        }
        break;
        
      case 'On Time':
        // In progress, on schedule
        const daysFromStart = Math.floor(Math.random() * 10) + 5; // 5-15 days from start
        const daysToEnd = Math.floor(Math.random() * 10) + 5; // 5-15 days to end
        startDate = new Date(now.getTime() - (daysFromStart * oneDay));
        endDate = new Date(now.getTime() + (daysToEnd * oneDay));
        plannedEndDate = new Date(endDate);
        // Calculate expected progress based on timeline
        const totalDays = daysFromStart + daysToEnd;
        const expectedProgress = Math.round((daysFromStart / totalDays) * 100);
        progress = expectedProgress;
        break;
        
      case 'Early Start':
        // Started early, progress appropriate for time elapsed
        startDate = new Date(now.getTime() - (20 * oneDay)); // Started 20 days ago
        const plannedStartDate = new Date(now.getTime() - (10 * oneDay)); // Was planned to start 10 days ago
        endDate = new Date(now.getTime() + (10 * oneDay)); // Will end in 10 days
        plannedEndDate = new Date(endDate);
        
        // Calculate progress based on early start
        const actualTimeElapsed = now.getTime() - startDate.getTime();
        const plannedTimeElapsed = now.getTime() - plannedStartDate.getTime();
        const totalPlannedTime = plannedEndDate.getTime() - plannedStartDate.getTime();
        const actualSchedulePercentage = (actualTimeElapsed / totalPlannedTime) * 100;
        progress = Math.min(99, Math.floor(actualSchedulePercentage));
        break;
        
      case 'Delayed':
        // In progress but behind schedule
        progress = Math.floor(Math.random() * 20) + 30; // 30-50% complete
        startDate = new Date(now.getTime() - (10 * oneDay)); // Started 10 days ago
        endDate = new Date(now.getTime() + (5 * oneDay)); // Will end in 5 days
        plannedEndDate = new Date(now.getTime() - (2 * oneDay)); // Was planned to end 2 days ago
        delayDays = Math.floor((endDate.getTime() - plannedEndDate.getTime()) / oneDay);
        break;
        
      case 'Critically Delayed':
        // Past due date with incomplete progress
        progress = Math.floor(Math.random() * 50) + 20; // 20-70% complete
        startDate = new Date(now.getTime() - (20 * oneDay)); // Started 20 days ago
        plannedEndDate = new Date(now.getTime() - (5 * oneDay)); // Was planned to end 5 days ago
        // New end date is in the future based on current progress
        const remainingWork = 100 - progress;
        const daysNeeded = Math.ceil((remainingWork / progress) * 20); // Extrapolate from current rate
        endDate = new Date(now.getTime() + (daysNeeded * oneDay));
        delayDays = Math.floor((endDate.getTime() - plannedEndDate.getTime()) / oneDay);
        break;
        
      case 'Yet to Start':
        // Not started yet, but scheduled to start soon
        progress = 0;
        startDate = new Date(now.getTime() + (3 * oneDay)); // Will start in 3 days
        endDate = new Date(now.getTime() + (15 * oneDay)); // Will end in 15 days
        plannedEndDate = new Date(endDate);
        break;
    }
    
    task.startDate = startDate;
    task.endDate = endDate;
    task.plannedEndDate = plannedEndDate;
    task.progress = progress;
    task.delayDays = delayDays;
    
    return task;
  }

  // Mark some tasks as go-live tasks and set their status
  let totalGoLiveTasks = 0;
  const goLiveCandidates: Task[] = [];
  
  // First pass: identify potential go-live candidates
  tasks.forEach(task => {
    // Only leaf tasks (no children) should be go-live tasks
    if (task.stageId === STAGES.find(s => s.name === 'Deployment')?.id || 
        task.stageId === STAGES.find(s => s.name === 'Testing')?.id || 
        task.stageId === STAGES.find(s => s.name === 'Integration')?.id || 
        task.taskName.toLowerCase().includes('launch') || 
        task.taskName.toLowerCase().includes('deploy') || 
        task.taskName.toLowerCase().includes('release')) {
      
      if (!task.isParent && !task.isDeleted) {
        goLiveCandidates.push(task);
      }
    }
  });
  
  // Shuffle candidates to randomize selection
  goLiveCandidates.sort(() => Math.random() - 0.5);
  
  // Second pass: assign go-live status and set appropriate properties
  goLiveCandidates.forEach(task => {
    // Check if we've already met our total target
    const totalTarget = goLiveTaskStatuses.reduce((sum, status) => sum + status.target, 0);
    if (totalGoLiveTasks >= totalTarget) return;
    
    // Find a status that hasn't met its target yet
    const availableStatuses = goLiveTaskStatuses.filter(status => status.count < status.target);
    if (availableStatuses.length === 0) return;
    
    // Select a random status from available ones
    const selectedStatus = availableStatuses[Math.floor(Math.random() * availableStatuses.length)];
    
    // Mark as go-live and set appropriate status
    task.goLive = true;
    setTaskForStatus(task, selectedStatus.name);
    
    // Update counts
    selectedStatus.count++;
    totalGoLiveTasks++;
  });
  
  // If we still need more go-live tasks, create some new ones
  if (totalGoLiveTasks < 15) {
    goLiveTaskStatuses.forEach((status) => {
      while (status.count < status.target) {
        // Create a new task specifically for this status
        const stageId = [
          STAGES.find(s => s.name === 'Deployment')?.id, 
          STAGES.find(s => s.name === 'Testing')?.id, 
          STAGES.find(s => s.name === 'Integration')?.id
        ][Math.floor(Math.random() * 3)];
        
        const productId = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)].id;
        
        const newTask: Task = {
          id: `gl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          siNo: siNo++,
          wbsNo: `GL.${status.count + 1}`,
          taskName: `Go-Live: ${status.name} Task ${status.count + 1}`,
          level: 1,
          predecessorIds: null,
          startDate: new Date(),
          endDate: new Date(),
          duration: 7,
          actualStartDate: null,
          actualEndDate: null,
          actualDuration: null,
          progress: 0,
          goLive: true,
          financialMilestone: false,
          remarks: [],
          view: 'External',
          createdAt: new Date(),
          updatedAt: new Date(),
          stageId: stageId || STAGES[STAGES.length - 1].id,
          productId: productId,
          isParent: false,
          isDeleted: false,
          financialValue: 0,
          plannedEndDate: new Date(),
          delayDays: 0
        };
        
        // Set the task's properties based on the desired status
        setTaskForStatus(newTask, status.name);
        
        // Add to the list of tasks
        tasks.push(newTask);
        status.count++;
        totalGoLiveTasks++;
      }
    });
  }

  // Create a special hypercare go-live task that's always at the top (for screenshot match)
  const hypercareTask: Task = {
    id: `task-hypercare-${siNo}`,
    siNo: siNo++,
    wbsNo: `GL.HC`,
    taskName: `Hypercare`,
    level: 1,
    predecessorIds: null,
    startDate: new Date(2025, 8, 15), // Sep 15, 2025
    endDate: new Date(2025, 8, 21),   // Sep 21, 2025
    duration: 7,
    actualStartDate: null,
    actualEndDate: null,
    actualDuration: null,
    progress: 0,
    goLive: true,
    financialMilestone: false,
    remarks: [],
    view: 'External',
    createdAt: new Date(),
    updatedAt: new Date(),
    stageId: STAGES[STAGES.length - 1].id,
    productId: PRODUCTS[0].id,
    isParent: false,
    isDeleted: false,
    financialValue: 0,
    plannedEndDate: new Date(2025, 8, 21),
    delayDays: 0
  };
  
  // Add support transition tasks (match screenshot)
  const supportTask: Task = {
    id: `task-support-${siNo}`,
    siNo: siNo++,
    wbsNo: `GL.ST`,
    taskName: `Support Transition`,
    level: 1,
    predecessorIds: `${hypercareTask.siNo}`,
    startDate: new Date(2025, 9, 5), // Oct 5, 2025
    endDate: new Date(2025, 9, 11),  // Oct 11, 2025
    duration: 7,
    actualStartDate: null,
    actualEndDate: null,
    actualDuration: null,
    progress: 0,
    goLive: true,
    financialMilestone: false,
    remarks: [],
    view: 'External',
    createdAt: new Date(),
    updatedAt: new Date(),
    stageId: STAGES[STAGES.length - 1].id,
    productId: PRODUCTS[1].id,
    isParent: false,
    isDeleted: false,
    financialValue: 0,
    plannedEndDate: new Date(2025, 9, 11),
    delayDays: 0
  };
  
  // Add support transition subtask (match screenshot)
  const supportSubtask: Task = {
    id: `task-support-subtask-${siNo}`,
    siNo: siNo++,
    wbsNo: `GL.ST.1`,
    taskName: `Support Transition Subtask 1`,
    level: 2,
    predecessorIds: `${supportTask.siNo}`,
    startDate: new Date(2025, 8, 22), // Sep 22, 2025
    endDate: new Date(2025, 8, 28),   // Sep 28, 2025
    duration: 7,
    actualStartDate: null,
    actualEndDate: null,
    actualDuration: null,
    progress: 0,
    goLive: true,
    financialMilestone: false,
    remarks: [],
    view: 'External',
    createdAt: new Date(),
    updatedAt: new Date(),
    stageId: STAGES[STAGES.length - 1].id, 
    productId: PRODUCTS[1].id,
    isParent: false,
    isDeleted: false,
    financialValue: 0,
    plannedEndDate: new Date(2025, 8, 28),
    delayDays: 0
  };
  
  // Push these critical tasks first - with exact dates matching the screenshot
  tasks.push(hypercareTask);
  tasks.push(supportTask);
  tasks.push(supportSubtask);

  // Now let's ensure our Go-Live tasks have appropriate progress values and correct dates
  // Find and update the go-live tasks to exactly match what we see in the screenshot
  const hypercareIndex = tasks.findIndex(t => t.taskName === 'Hypercare');
  if (hypercareIndex !== -1) {
    tasks[hypercareIndex].startDate = new Date(2025, 8, 15); // Sep 15, 2025
    tasks[hypercareIndex].endDate = new Date(2025, 8, 21);   // Sep 21, 2025
    tasks[hypercareIndex].progress = 0;
  }

  const supportIndex = tasks.findIndex(t => t.taskName === 'Support Transition');
  if (supportIndex !== -1) {
    tasks[supportIndex].startDate = new Date(2025, 9, 5);  // Oct 5, 2025
    tasks[supportIndex].endDate = new Date(2025, 9, 11);   // Oct 11, 2025
    tasks[supportIndex].progress = 0;
  }

  const supportSubtaskIndex = tasks.findIndex(t => t.taskName === 'Support Transition Subtask 1');
  if (supportSubtaskIndex !== -1) {
    tasks[supportSubtaskIndex].startDate = new Date(2025, 8, 22); // Sep 22, 2025
    tasks[supportSubtaskIndex].endDate = new Date(2025, 8, 28);   // Sep 28, 2025
    tasks[supportSubtaskIndex].progress = 0;
  }
  
  // Ensure each product has at least one of each status type
  // Add additional tasks if needed to fill gaps
  const statusTypes = [
    'early-finish', 'completed', 'early-start', 'delayed', 
    'before-time', 'on-time', 'critically-delayed', 'yet-to-start'
  ];
  
  PRODUCTS.forEach(product => {
    const statusCounts = productStatusDistributions[product.id];
    
    statusTypes.forEach(status => {
      if (statusCounts[status] === 0) {
        // Add 1-2 additional tasks with this status for this product
        const numAdditional = 1 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numAdditional; i++) {
          const randomStageIndex = Math.floor(Math.random() * STAGES.length);
          const stageObj = STAGES[randomStageIndex];
          
          const startDate = new Date();
          startDate.setDate(today.getDate() - 20 + (randomStageIndex * 15));
          
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 5);
          
          const plannedEndDate = new Date(startDate);
          plannedEndDate.setDate(startDate.getDate() + 5);
          
          let additionalTask: Task = {
            id: `task-${siNo}`,
            siNo: siNo++,
            wbsNo: `Add.${randomStageIndex}.${i}`,
            taskName: `${product.name} - ${stageObj.name} Task ${i+1}`,
            level: 1,
            predecessorIds: null,
            startDate: startDate,
            endDate: endDate,
            duration: 5,
            actualStartDate: null,
            actualEndDate: null,
            actualDuration: null,
            progress: 0,
            goLive: false,
            financialMilestone: false,
            remarks: [],
            view: 'External',
            createdAt: new Date(),
            updatedAt: new Date(),
            stageId: stageObj.id,
            productId: product.id,
            isParent: false,
            isDeleted: false,
            financialValue: 0,
            plannedEndDate: plannedEndDate,
            delayDays: 0
          };
          
          // Apply task status
          additionalTask = calculateStatusMetrics(additionalTask, status) as Task;
          tasks.push(additionalTask);
          
          // Update the status count
          statusCounts[status] += 1;
        }
      }
    });
  });
  
  return tasks;
};

// Helper function to calculate schedule percentage (definition matches dashboard logic)
function calculateSchedulePercentage(startDate: Date | null, endDate: Date | null): number {
  // If either date is missing, return 0
  if (!startDate || !endDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // If task hasn't started yet
  if (today < start) return 0;

  // If task is completed or overdue
  if (today > end) return 100;

  // Calculate percentage based on elapsed time
  const totalDuration = end.getTime() - start.getTime();
  const elapsedDuration = today.getTime() - start.getTime();
  
  return Math.round((elapsedDuration / totalDuration) * 100);
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: true
});

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      const dummyTasks = generateDummyTasks();
      setTasks(dummyTasks);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, loading }}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider; 