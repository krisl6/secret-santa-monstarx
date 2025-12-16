// Email notification helper
// Calls the Netlify function to send assignment emails

interface SendAssignmentEmailParams {
    to: string;
    receiverName: string;
    teamName: string;
    budget: string;
}

export async function sendAssignmentEmail(params: SendAssignmentEmailParams): Promise<boolean> {
    try {
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to send email:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}

// Send emails to all team members after drawing names
export async function sendAllAssignmentEmails(
    teamName: string,
    budget: string,
    assignments: Array<{
        giverEmail: string;
        receiverName: string;
    }>
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const assignment of assignments) {
        const result = await sendAssignmentEmail({
            to: assignment.giverEmail,
            receiverName: assignment.receiverName,
            teamName,
            budget,
        });

        if (result) {
            success++;
        } else {
            failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { success, failed };
}
