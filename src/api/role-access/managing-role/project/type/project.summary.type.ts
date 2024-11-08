export type ProjectStats = {
    invitations: {
      pendingCount: number;
      acceptedCount: number;
      declinedCount: number;
      canceledCount: number;
      totalInvitations: number;
    };
    tasks: {
      totalTasks: number;
      todoTasks: number;
      inProgressTasks: number;
      doneTasks: number;
      haltedTasks: number;
      archivedTasks: number;
    };
    participations: {
      totalParticipations: number;
      activeParticipations: number;
      inactiveParticipations: number;
    };
    stakeholders: {
      totalStakeholders: number;
    };
    wallet: {
      estimatedBudget: number;
      balance: number;
      transactions: {
        totalTransactions: number;
        totalCredits: number;
        totalDebits: number;
        creditTransactions: number;
        debitTransactions: number;
      };
    };
    teams: {
      totalTeams: number;
      activeTeams: number;
      inactiveTeams: number;
    };
  };
  