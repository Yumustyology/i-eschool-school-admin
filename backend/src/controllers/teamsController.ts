import { Request, Response } from 'express';
import { logActivity } from '../utils/activityLogger';

export const sendTeamsMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { webhookUrl, message } = req.body;

    const teamsMessage = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: 'i-eSchool Notification',
      themeColor: '6264A7',
      title: 'i-eSchool Admin Panel',
      sections: [
        {
          activityTitle: 'New Message',
          activitySubtitle: new Date().toLocaleString(),
          text: message,
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamsMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Teams API error:', errorText);
      throw new Error('Failed to send message to Teams');
    }

    res.status(200).json({
      success: true,
      message: 'Message sent to Microsoft Teams successfully',
    });
    await logActivity({
      action: 'Teams message sent',
      entityType: 'teams',
      description: message.slice(0, 120),
      metadata: { messageLength: message.length },
    });
  } catch (error) {
    console.error('Error sending to Teams:', error);
    res.status(500).json({
      error: 'Failed to send message to Teams',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
