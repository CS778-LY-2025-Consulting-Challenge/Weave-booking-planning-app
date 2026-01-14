import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    console.log('Auth userId:', userId);

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userType } = body;

    console.log('Updating user with userType:', userType);

    if (!userType || !['traveler', 'guide'].includes(userType)) {
      return Response.json({ error: 'Invalid user type' }, { status: 400 });
    }

    // Update user metadata on the server
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        userType,
      },
    });

    console.log('User updated successfully');

    return Response.json({ success: true, userType });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return Response.json(
      { error: `Failed to update user metadata: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
