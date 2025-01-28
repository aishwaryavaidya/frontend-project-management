import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'react-hot-toast';
import { db } from '@/prisma/db';

interface RYGFormProps {
  onClose: () => void;
}

export function RYGForm({ onClose }: RYGFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'RED' | 'YELLOW'>('RED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !status) {
      toast.error('Please fill in all fields');
      return;
    }

    if (description.split(' ').length > 100) {
      toast.error('Description should not exceed 100 words');
      return;
    }

    setIsSubmitting(true);

    try {
      await db.rYGStatus.create({
        data: {
          title,
          description,
          status,
          createdBy: 1, // Replace with actual user ID from auth
        },
      });

      toast.success('Status submitted successfully');
      setTitle('');
      setDescription('');
      setStatus('RED');
      onClose();
    } catch (error) {
      console.error('Error submitting RYG status:', error);
      toast.error('Failed to submit status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Issue Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter issue title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (max 100 words)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue..."
          className="h-32"
          required
        />
        <div className="text-sm text-gray-500 mt-1">
          {description.split(' ').length}/100 words
        </div>
      </div>

      <div>
        <Label>Project Status</Label>
        <RadioGroup
          value={status}
          onValueChange={(value) => setStatus(value as 'RED' | 'YELLOW')}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="RED" id="red" />
            <Label htmlFor="red" className="text-red-500 font-semibold">RED</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="YELLOW" id="yellow" />
            <Label htmlFor="yellow" className="text-yellow-500 font-semibold">YELLOW</Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Status'}
      </Button>
    </form>
  );
}