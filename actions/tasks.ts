import { supabase } from '../lib/supabase';
import { createId } from '@paralleldrive/cuid2';

export async function getTasks(userId: string) {
  try {
    const { data: tasks, error } = await supabase
      .from('Task')
      .select('*')
      .eq('userId', userId)
      .order('id', { ascending: false });

    if (error) {
      throw error;
    }

    if (!tasks) {
      return [];
    }

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      completed: task.isCompleted || false,
      type: (task.type === 'MY_DAY' ? 'my_day' : task.type === 'PLANNED' ? 'tomorrow' : 'backlog') as 'my_day' | 'backlog' | 'tomorrow',
      createdAt: Date.now(), // Fallback since createdAt doesn't exist in DB
      dueDate: task.dueDate ? new Date(task.dueDate).getTime() : undefined,
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
}

export async function createTask(userId: string, title: string, type: 'my_day' | 'backlog' | 'tomorrow', dueDate?: Date) {
  try {
    const taskType = type === 'my_day' ? 'MY_DAY' : type === 'tomorrow' ? 'PLANNED' : 'BACKLOG';
    
    const { data: task, error } = await supabase
      .from('Task')
      .insert({
        id: createId(),
        userId,
        title,
        type: taskType,
        isCompleted: false,
        dueDate: dueDate ? dueDate.toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!task) {
      throw new Error('Failed to create task');
    }

    return {
      id: task.id,
      title: task.title,
      completed: task.isCompleted || false,
      type: type,
      createdAt: Date.now(), // Use current time for newly created tasks
      dueDate: task.dueDate ? new Date(task.dueDate).getTime() : undefined,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
}

export async function toggleTask(taskId: string) {
  try {
    // Fetch current task
    const { data: task, error: fetchError } = await supabase
      .from('Task')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError || !task) {
      throw new Error('Task not found');
    }

    // Toggle completion
    const { data: updatedTask, error: updateError } = await supabase
      .from('Task')
      .update({ isCompleted: !task.isCompleted })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return {
      id: updatedTask.id,
      title: updatedTask.title,
      completed: updatedTask.isCompleted || false,
      type: (updatedTask.type === 'MY_DAY' ? 'my_day' : updatedTask.type === 'PLANNED' ? 'tomorrow' : 'backlog') as 'my_day' | 'backlog' | 'tomorrow',
      createdAt: Date.now(), // Fallback since createdAt doesn't exist in DB
      dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).getTime() : undefined,
    };
  } catch (error) {
    console.error('Error toggling task:', error);
    throw new Error('Failed to toggle task');
  }
}

export async function moveTask(taskId: string, targetType: 'my_day' | 'backlog' | 'tomorrow') {
  try {
    const taskType = targetType === 'my_day' ? 'MY_DAY' : targetType === 'tomorrow' ? 'PLANNED' : 'BACKLOG';
    
    const { data: updatedTask, error } = await supabase
      .from('Task')
      .update({ type: taskType })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return {
      id: updatedTask.id,
      title: updatedTask.title,
      completed: updatedTask.isCompleted || false,
      type: targetType,
      createdAt: Date.now(), // Fallback since createdAt doesn't exist in DB
      dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).getTime() : undefined,
    };
  } catch (error) {
    console.error('Error moving task:', error);
    throw new Error('Failed to move task');
  }
}

export async function updateTaskDueDate(taskId: string, dueDate: Date | null) {
  try {
    const { data: updatedTask, error } = await supabase
      .from('Task')
      .update({ dueDate: dueDate ? dueDate.toISOString() : null })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return {
      id: updatedTask.id,
      title: updatedTask.title,
      completed: updatedTask.isCompleted || false,
      type: (updatedTask.type === 'MY_DAY' ? 'my_day' : updatedTask.type === 'PLANNED' ? 'tomorrow' : 'backlog') as 'my_day' | 'backlog' | 'tomorrow',
      createdAt: Date.now(),
      dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).getTime() : undefined,
    };
  } catch (error) {
    console.error('Error updating task due date:', error);
    throw new Error('Failed to update task due date');
  }
}

export async function deleteTask(taskId: string) {
  try {
    const { error } = await supabase
      .from('Task')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
}
