



import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RoscaCycle, Member, RoscaMonth, PaymentStatus, RuleType, AuthUser } from './types';
import { LoginPage } from './components/LoginPage';
import AdminView from './components/AdminView';
import MemberDashboard from './components/MemberDashboard';

// Helper to shuffle an array
// FIX: Add a trailing comma to the generic type parameter <T> to prevent the JSX parser from misinterpreting it as an HTML tag. This resolves numerous downstream parsing errors.
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const createNewCycle = (name: string): RoscaCycle => {
  const initialMembers: Omit<Member, 'id' | 'avatarUrl' | 'joiningMonthName'>[] = [
    { name: 'Alice', joinMonth: 1, lateFeePaid: 0 }, { name: 'Bob', joinMonth: 1, lateFeePaid: 0 },
    { name: 'Charlie', joinMonth: 1, lateFeePaid: 0 }, { name: 'Diana', joinMonth: 1, lateFeePaid: 0 },
    { name: 'Eve', joinMonth: 1, lateFeePaid: 0 }, { name: 'Frank', joinMonth: 1, lateFeePaid: 0 },
    { name: 'Grace', joinMonth: 1, lateFeePaid: 0 },
  ];

  const members: Member[] = initialMembers.map((m, i) => ({
    ...m,
    id: (i + 1).toString(),
    avatarUrl: `https://picsum.photos/seed/${m.name.toLowerCase()}/100`,
    joiningMonthName: `Month ${m.joinMonth}`,
  }));

  const monthlyContributionAmount = 1000;
  const cycleLength = members.length;

  const months: RoscaMonth[] = Array.from({ length: cycleLength }, (_, i) => ({
    month: i + 1,
    payoutMemberId: null, // Recipient is determined upon month finalization
    payoutAmount: null,
    contributions: members.map(m => ({ memberId: m.id, status: PaymentStatus.PENDING })),
  }));

  return {
    id: crypto.randomUUID(),
    name,
    members,
    monthlyContributionAmount,
    currentMonth: 1,
    months,
    ruleType: RuleType.STRICT,
    joiningFee: 1000,
    cycleLength,
    isArchived: false,
    savingsFund: 0,
  };
};

const generateInitialRoscaState = (): RoscaCycle[] => {
  return [createNewCycle('My First Trust Circle')];
};

const App: React.FC = () => {
  const [roscaCycles, setRoscaCycles] = useState<RoscaCycle[]>(generateInitialRoscaState);
  const [activeCycleId, setActiveCycleId] = useState<string | null>(roscaCycles[0]?.id ?? null);
  const [authUser, setAuthUser] = useState<AuthUser>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (localStorage.getItem('theme') === 'dark') {
      return 'dark';
    }
    if (localStorage.getItem('theme') === 'light') {
        return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const activeCycle = useMemo(() => roscaCycles.find(c => c.id === activeCycleId), [roscaCycles, activeCycleId]);
  
  const handleLogin = (user: Omit<AuthUser, 'name' | 'id'> & { id?: string; name?: string }) => {
    if (user.role === 'admin') {
      setAuthUser({ id: 'admin-user', name: 'Administrator', role: 'admin' });
    } else if (user.role === 'member' && user.cycleId && user.id) {
      const cycle = roscaCycles.find(c => c.id === user.cycleId);
      const member = cycle?.members.find(m => m.id === user.id);
      if (member) {
        setAuthUser({ ...member, role: 'member', cycleId: user.cycleId });
      }
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
  };

  const updateCycle = useCallback((cycleId: string, updater: (cycle: RoscaCycle) => RoscaCycle) => {
    setRoscaCycles(prevCycles => prevCycles.map(cycle => (cycle.id === cycleId ? updater(cycle) : cycle)));
  }, []);

  const handleMarkAsPaid = useCallback((memberId: string, amount: number) => {
    if (!activeCycleId) return;
    updateCycle(activeCycleId, cycle => {
      const currentMonthObject = cycle.months.find(m => m.month === cycle.currentMonth);
      const contribution = currentMonthObject?.contributions.find(c => c.memberId === memberId);

      // If already paid, do nothing to prevent adding to savings fund again.
      if (contribution?.status === PaymentStatus.PAID) {
        return cycle;
      }
      
      const savingsFromThisPayment = amount * 0.20;
      const newSavingsFund = cycle.savingsFund + savingsFromThisPayment;

      return {
        ...cycle,
        savingsFund: newSavingsFund,
        months: cycle.months.map(month =>
          month.month === cycle.currentMonth
            ? {
                ...month,
                contributions: month.contributions.map(c =>
                  c.memberId === memberId ? { ...c, status: PaymentStatus.PAID, paymentDate: new Date().toISOString(), amountPaid: amount } : c
                ),
              }
            : month
        ),
      };
    });
  }, [activeCycleId, updateCycle]);

  const handleUpdateContribution = useCallback((monthNumber: number, memberId: string, newStatus: PaymentStatus, paymentDate?: string, amountPaid?: number) => {
    if (!activeCycleId) return;
    updateCycle(activeCycleId, cycle => {
        const monthToUpdate = cycle.months.find(m => m.month === monthNumber);
        if (!monthToUpdate) return cycle;

        const originalContribution = monthToUpdate.contributions.find(c => c.memberId === memberId);
        if (!originalContribution) return cycle;

        const wasPaid = originalContribution.status === PaymentStatus.PAID;
        const isPaid = newStatus === PaymentStatus.PAID;

        const originalAmountPaid = originalContribution.amountPaid || 0;
        const newAmountPaid = isPaid ? (amountPaid !== undefined ? amountPaid : cycle.monthlyContributionAmount) : 0;
        
        const savingsFundAdjustment = (newAmountPaid * 0.20) - (originalAmountPaid * 0.20);
        const newSavingsFund = cycle.savingsFund + savingsFundAdjustment;

        const updatedMonths = cycle.months.map(month => {
            if (month.month === monthNumber) {
                return {
                    ...month,
                    contributions: month.contributions.map(c => {
                        if (c.memberId === memberId) {
                            const updatedContribution: any = { ...c, status: newStatus, paymentDate: paymentDate || c.paymentDate };
                            if (isPaid) {
                                updatedContribution.amountPaid = newAmountPaid;
                            } else {
                                delete updatedContribution.amountPaid;
                            }
                            return updatedContribution;
                        }
                        return c;
                    })
                };
            }
            return month;
        });

        return { ...cycle, months: updatedMonths, savingsFund: newSavingsFund };
    });
  }, [activeCycleId, updateCycle]);

  const handleAdvanceToNextMonth = useCallback((payoutAmount: number) => {
    if (!activeCycleId) return;
    updateCycle(activeCycleId, cycle => {
      const currentMonthIndex = cycle.currentMonth - 1;
      const currentMonthObject = cycle.months[currentMonthIndex];

      if (!currentMonthObject || currentMonthIndex >= cycle.months.length) {
          return cycle; // Cycle already complete or invalid state
      }

      // Savings are now calculated with each payment in `handleMarkAsPaid`.
      // No need to calculate them here.

      // 1. Determine the recipient for the month being finalized.
      const paidOutMemberIds = new Set(
          cycle.months
              .filter(m => m.payoutMemberId)
              .map(m => m.payoutMemberId!)
      );

      const eligibleMembers = cycle.members.filter(m => !paidOutMemberIds.has(m.id));
      let recipientIdForCurrentMonth: string | null = null;

      if (eligibleMembers.length > 0) {
          const shuffledEligible = shuffleArray(eligibleMembers);
          recipientIdForCurrentMonth = shuffledEligible[0].id;
      }

      // 2. Update the months array
      const updatedMonths = cycle.months.map((month, index) => {
          if (index === currentMonthIndex) {
              // Finalize current month: set recipient and mark pending as overdue
              return {
                  ...month,
                  payoutMemberId: recipientIdForCurrentMonth,
                  payoutAmount,
                  contributions: month.contributions.map(c =>
                      c.status === PaymentStatus.PENDING ? { ...c, status: PaymentStatus.OVERDUE } : c
                  ),
              };
          }
          return month;
      });
      
      const nextMonthNumber = cycle.currentMonth + 1;
      
      return { ...cycle, months: updatedMonths, currentMonth: nextMonthNumber };
    });
  }, [activeCycleId, updateCycle]);

  const handleSetRuleType = useCallback((ruleType: RuleType) => {
    if (!activeCycleId) return;
    updateCycle(activeCycleId, cycle => ({ ...cycle, ruleType }));
  }, [activeCycleId, updateCycle]);

  const handleAddMember = useCallback((name: string, joiningAmount: number, avatarDataUrl: string | null) => {
    if (!activeCycleId) return;
    updateCycle(activeCycleId, cycle => {
      const newMember: Member = {
        id: crypto.randomUUID(), name, avatarUrl: avatarDataUrl || `https://picsum.photos/seed/${name.toLowerCase()}/100`,
        joinMonth: cycle.currentMonth, lateFeePaid: joiningAmount, joiningMonthName: `Month ${cycle.currentMonth}`,
      };
      
      // A new member is considered to have paid for all months up to and including the current one.
      // We need to add 20% of their contribution for each of these months to the savings fund.
      const numberOfPaidMonths = cycle.currentMonth;
      const savingsFromNewMember = (cycle.monthlyContributionAmount * 0.20) * numberOfPaidMonths;
      const newSavingsFund = cycle.savingsFund + savingsFromNewMember;

      const updatedMembers = [...cycle.members, newMember];
      const newCycleLength = updatedMembers.length;
      
      // Add the new member to all existing months' contributions
      const updatedExistingMonths = cycle.months.map(month => ({
        ...month,
        contributions: [
          ...month.contributions,
          { 
            memberId: newMember.id, 
            status: month.month <= cycle.currentMonth ? PaymentStatus.PAID : PaymentStatus.PENDING,
            ...(month.month <= cycle.currentMonth && { 
              paymentDate: new Date().toISOString(),
              amountPaid: cycle.monthlyContributionAmount 
            })
          }
        ]
      }));

      // Add a new month for the new member, extending the cycle
      const newMonthToAdd: RoscaMonth = {
        month: cycle.months.length + 1,
        payoutMemberId: null,
        payoutAmount: null,
        contributions: updatedMembers.map(m => ({ memberId: m.id, status: PaymentStatus.PENDING })),
      };

      const updatedMonths = [...updatedExistingMonths, newMonthToAdd];
      
      return { ...cycle, members: updatedMembers, months: updatedMonths, cycleLength: newCycleLength, savingsFund: newSavingsFund };
    });
  }, [activeCycleId, updateCycle]);


  const handleSetJoiningFee = useCallback((fee: number) => {
    if (isNaN(fee) || fee < 0 || !activeCycleId) return;
    updateCycle(activeCycleId, cycle => ({ ...cycle, joiningFee: fee }));
  }, [activeCycleId, updateCycle]);

  const handleEditMember = useCallback((memberId: string, updatedDetails: { name: string; avatarUrl: string; joiningMonthName: string; }) => {
    if (!activeCycleId) return;
    updateCycle(activeCycleId, cycle => ({
      ...cycle,
      members: cycle.members.map(member => (member.id === memberId ? { ...member, ...updatedDetails } : member)),
    }));
  }, [activeCycleId, updateCycle]);

  const handleRemoveMember = useCallback((memberIdToRemove: string) => {
    if (!activeCycleId) return;
    updateCycle(activeCycleId, cycle => {
      if (cycle.members.length <= 1) { alert("Cannot remove the last member."); return cycle; }
      
      const hasBeenPaidOut = cycle.months.some(m => m.month < cycle.currentMonth && m.payoutMemberId === memberIdToRemove);
      if (hasBeenPaidOut) { alert("A member who has already received their payout cannot be removed."); return cycle; }

      const isCurrentRecipient = cycle.months.some(m => m.month === cycle.currentMonth && m.payoutMemberId === memberIdToRemove);
      if (isCurrentRecipient) { alert("Cannot remove the member scheduled for the current month's payout."); return cycle; }

      const newMembersList = cycle.members.filter(m => m.id !== memberIdToRemove);
      const newCycleLength = newMembersList.length;
      
      const updatedMonths = cycle.months
        .map(m => ({
          ...m,
          // If the removed member was a future recipient, nullify the slot.
          payoutMemberId: m.payoutMemberId === memberIdToRemove ? null : m.payoutMemberId,
          contributions: m.contributions.filter(c => c.memberId !== memberIdToRemove)
        }))
        .slice(0, newCycleLength); // Shorten the cycle by removing the last month

      return { ...cycle, members: newMembersList, months: updatedMonths, cycleLength: newCycleLength };
    });
  }, [activeCycleId, updateCycle]);

  const handleCreateNewCycle = useCallback(() => {
    const newCycle = createNewCycle(`New Circle #${roscaCycles.length + 1}`);
    setRoscaCycles(prev => [...prev, newCycle]);
    setActiveCycleId(newCycle.id);
  }, [roscaCycles.length]);

  const handleDeleteCycle = useCallback((cycleId: string) => {
    setRoscaCycles(prev => {
        const newCycles = prev.filter(c => c.id !== cycleId);
        if (activeCycleId === cycleId) {
            setActiveCycleId(newCycles[0]?.id ?? null);
        }
        return newCycles;
    });
  }, [activeCycleId]);

  const handleRenameCycle = useCallback((cycleId: string, newName: string) => {
    if(!newName.trim()) return;
    updateCycle(cycleId, cycle => ({ ...cycle, name: newName.trim() }));
  }, [updateCycle]);
  
  const handleArchiveCycle = useCallback((cycleId: string) => {
    updateCycle(cycleId, cycle => ({ ...cycle, isArchived: true }));
  }, [updateCycle]);

  if (!authUser) {
    return <LoginPage onLogin={handleLogin} cycles={roscaCycles} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (authUser.role === 'admin') {
    return (
      <AdminView
        roscaCycles={roscaCycles}
        activeCycle={activeCycle}
        activeCycleId={activeCycleId}
        onSelectCycle={setActiveCycleId}
        onLogout={handleLogout}
        onMarkAsPaid={handleMarkAsPaid}
        onAdvanceToNextMonth={handleAdvanceToNextMonth}
        onSetRuleType={handleSetRuleType}
        onAddMember={handleAddMember}
        onSetJoiningFee={handleSetJoiningFee}
        onEditMember={handleEditMember}
        onRemoveMember={handleRemoveMember}
        onRenameCycle={handleRenameCycle}
        onCreateNewCycle={handleCreateNewCycle}
        onDeleteCycle={handleDeleteCycle}
        onArchiveCycle={handleArchiveCycle}
        onUpdateContribution={handleUpdateContribution}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (authUser.role === 'member' && authUser.cycleId) {
    const memberCycle = roscaCycles.find(c => c.id === authUser.cycleId);
    const memberDetails = memberCycle?.members.find(m => m.id === authUser.id);
    if (memberCycle && memberDetails) {
        return <MemberDashboard cycle={memberCycle} member={memberDetails} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
    }
  }

  // Fallback or error state
  return (
    <div className="flex items-center justify-center min-h-screen">
        <p>An error occurred. Please try logging out and back in.</p>
        <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default App;