'use server';

import { getSession } from '@/lib/session';
import { updateUserAdminStatus, deleteUser, updateUserRole } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleAdminStatus(userId: string, makeAdmin: boolean) {
  const session = await getSession();
  
  if (!session?.isAdmin) {
    throw new Error('Unauthorized: Only administrators can change roles');
  }

  try {
    await updateUserAdminStatus(userId, makeAdmin);
    revalidatePath('/dashboard/admin');
    return { success: true };
  } catch (error) {
    console.error('Error toggling admin status:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

export async function modifyUserRole(userId: string, role: 'platform_admin' | 'reporter' | 'company_member') {
  const session = await getSession();
  
  if (!session?.isAdmin) {
    throw new Error('Unauthorized: Only administrators can change roles');
  }

  try {
    await updateUserRole(userId, role);
    revalidatePath('/dashboard/admin');
    return { success: true };
  } catch (error) {
    console.error('Error modifying user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

export async function removeUser(userId: string) {
  const session = await getSession();
  
  if (!session?.isAdmin) {
    throw new Error('Unauthorized: Only administrators can delete users');
  }

  // Prevent admin from deleting themselves
  if (session.userId === userId) {
    return { success: false, error: 'You cannot delete your own account' };
  }

  try {
    await deleteUser(userId);
    revalidatePath('/dashboard/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
