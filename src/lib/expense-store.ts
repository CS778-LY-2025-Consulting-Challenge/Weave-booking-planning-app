import {
  Expense,
  ExpenseShare,
  Trip,
  TripParticipant,
} from '@/types/expense';

/**
 * In-memory data store for MVP
 * TODO: Replace with database (Prisma, MongoDB, etc.)
 */

class ExpenseStore {
  private trips: Map<string, Trip> = new Map();
  private participants: Map<string, TripParticipant[]> = new Map();
  private expenses: Map<string, Expense[]> = new Map();
  private expenseShares: Map<string, ExpenseShare[]> = new Map();

  // Trip operations
  createTrip(trip: Trip): Trip {
    this.trips.set(trip.id, trip);
    this.participants.set(trip.id, []);
    this.expenses.set(trip.id, []);
    return trip;
  }

  getTrip(tripId: string): Trip | undefined {
    return this.trips.get(tripId);
  }

  getTripsByUser(userId: string): Trip[] {
    const userTrips: Trip[] = [];
    this.participants.forEach((participants, tripId) => {
      if (participants.some((p) => p.userId === userId && p.isActive)) {
        const trip = this.trips.get(tripId);
        if (trip) {
          userTrips.push(trip);
        }
      }
    });
    return userTrips;
  }

  updateTrip(tripId: string, updates: Partial<Trip>): Trip | undefined {
    const trip = this.trips.get(tripId);
    if (!trip) return undefined;

    const updatedTrip = {
      ...trip,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.trips.set(tripId, updatedTrip);
    return updatedTrip;
  }

  // Participant operations
  addParticipant(participant: TripParticipant): TripParticipant {
    const participants = this.participants.get(participant.tripId) || [];
    participants.push(participant);
    this.participants.set(participant.tripId, participants);
    return participant;
  }

  getParticipants(tripId: string): TripParticipant[] {
    return this.participants.get(tripId) || [];
  }

  getParticipant(tripId: string, userId: string): TripParticipant | undefined {
    const participants = this.participants.get(tripId) || [];
    return participants.find((p) => p.userId === userId);
  }

  updateParticipant(
    tripId: string,
    userId: string,
    updates: Partial<TripParticipant>
  ): TripParticipant | undefined {
    const participants = this.participants.get(tripId) || [];
    const index = participants.findIndex((p) => p.userId === userId);
    if (index === -1) return undefined;

    participants[index] = { ...participants[index], ...updates };
    this.participants.set(tripId, participants);
    return participants[index];
  }

  // Expense operations
  createExpense(expense: Expense): Expense {
    const expenses = this.expenses.get(expense.tripId) || [];
    expenses.push(expense);
    this.expenses.set(expense.tripId, expenses);
    return expense;
  }

  getExpenses(tripId: string): Expense[] {
    return this.expenses.get(tripId) || [];
  }

  getExpense(expenseId: string): Expense | undefined {
    for (const expenses of this.expenses.values()) {
      const expense = expenses.find((e) => e.id === expenseId);
      if (expense) return expense;
    }
    return undefined;
  }

  updateExpense(
    expenseId: string,
    updates: Partial<Expense>
  ): Expense | undefined {
    for (const [tripId, expenses] of this.expenses.entries()) {
      const index = expenses.findIndex((e) => e.id === expenseId);
      if (index !== -1) {
        expenses[index] = {
          ...expenses[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        this.expenses.set(tripId, expenses);
        return expenses[index];
      }
    }
    return undefined;
  }

  deleteExpense(expenseId: string): boolean {
    return this.updateExpense(expenseId, { status: 'deleted' }) !== undefined;
  }

  // ExpenseShare operations
  createExpenseShares(shares: ExpenseShare[]): ExpenseShare[] {
    if (shares.length === 0) return [];

    const expenseId = shares[0].expenseId;
    const existingShares = this.expenseShares.get(expenseId) || [];
    const allShares = [...existingShares, ...shares];
    this.expenseShares.set(expenseId, allShares);
    return shares;
  }

  getExpenseShares(expenseId: string): ExpenseShare[] {
    return this.expenseShares.get(expenseId) || [];
  }

  getAllSharesForTrip(tripId: string): ExpenseShare[] {
    const expenses = this.getExpenses(tripId).filter(
      (e) => e.status === 'active'
    );
    const allShares: ExpenseShare[] = [];

    expenses.forEach((expense) => {
      const shares = this.getExpenseShares(expense.id);
      allShares.push(...shares);
    });

    return allShares;
  }

  // Utility: Check if user is participant
  isParticipant(tripId: string, userId: string): boolean {
    const participant = this.getParticipant(tripId, userId);
    return participant?.isActive === true;
  }

  // Utility: Check if user is owner
  isOwner(tripId: string, userId: string): boolean {
    const participant = this.getParticipant(tripId, userId);
    return participant?.role === 'owner';
  }
}

// Singleton instance
export const expenseStore = new ExpenseStore();
