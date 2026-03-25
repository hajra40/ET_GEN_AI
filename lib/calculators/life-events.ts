import type {
  LifeEventActionPlan,
  LifeEventInput,
  LifeEventQuestion,
  LifeEventType,
  UserProfile
} from "@/lib/types";

const questionBank: Record<LifeEventType, LifeEventQuestion[]> = {
  annual_bonus: [
    { id: "bonusAmount", label: "Bonus amount", type: "number", placeholder: "500000" },
    { id: "highInterestDebt", label: "High-interest debt outstanding", type: "number", placeholder: "0" },
    { id: "goalWithin3Years", label: "Nearest goal within 3 years", type: "text", placeholder: "Home down payment" }
  ],
  marriage: [
    { id: "weddingBudget", label: "Wedding budget", type: "number", placeholder: "2000000" },
    { id: "monthsToWedding", label: "Months to wedding", type: "number", placeholder: "9" },
    { id: "partnerIncome", label: "Partner monthly income", type: "number", placeholder: "90000" }
  ],
  new_baby: [
    { id: "deliveryCost", label: "Expected delivery cost", type: "number", placeholder: "180000" },
    { id: "childcareMonthly", label: "Estimated monthly childcare", type: "number", placeholder: "15000" },
    { id: "oneTimeSetup", label: "One-time setup costs", type: "number", placeholder: "120000" }
  ],
  inheritance: [
    { id: "inheritanceAmount", label: "Inheritance amount", type: "number", placeholder: "2500000" },
    { id: "liabilityToClear", label: "Debt you may clear", type: "number", placeholder: "500000" },
    { id: "useCase", label: "Primary intended use", type: "text", placeholder: "Retirement corpus" }
  ],
  job_loss: [
    { id: "monthsWithoutIncome", label: "Expected months without income", type: "number", placeholder: "6" },
    { id: "severance", label: "Severance received", type: "number", placeholder: "250000" },
    { id: "essentialExpenses", label: "Essential monthly expenses", type: "number", placeholder: "45000" }
  ],
  home_purchase: [
    { id: "propertyCost", label: "Property cost", type: "number", placeholder: "9000000" },
    { id: "downPayment", label: "Available down payment", type: "number", placeholder: "1800000" },
    { id: "timelineMonths", label: "Timeline in months", type: "number", placeholder: "12" }
  ]
};

function getNumber(value: string | number | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return Number(value ?? 0);
}

export function getLifeEventQuestions(eventType: LifeEventType) {
  return questionBank[eventType];
}

export function buildLifeEventPlan(profile: UserProfile, input: LifeEventInput): LifeEventActionPlan {
  const monthlySafetyNeed = profile.monthlyExpenses + profile.loanEmi;

  switch (input.eventType) {
    case "annual_bonus": {
      const bonusAmount = getNumber(input.answers.bonusAmount);
      const debt = getNumber(input.answers.highInterestDebt);
      const allocationToDebt = Math.min(debt, bonusAmount * 0.3);
      const allocationToEmergency = bonusAmount * 0.2;
      const allocationToInvestments = bonusAmount - allocationToDebt - allocationToEmergency;

      return {
        emergencyFundChange: `Add about ₹${allocationToEmergency.toLocaleString("en-IN")} to your emergency bucket if it is still below 6 to 9 months.`,
        allocationUpdate: `Route around ₹${allocationToInvestments.toLocaleString("en-IN")} into long-term goals after clearing high-interest debt worth ₹${allocationToDebt.toLocaleString("en-IN")}.`,
        insuranceAndTaxNote: "Check whether bonus taxation changes your preferred regime and avoid spending the full amount before TDS reconciliation.",
        now: [
          "Keep 20% of the bonus liquid until all annual obligations are visible.",
          "Clear personal loan or credit-card balances before making new equity bets.",
          "Assign the remaining surplus to the nearest high-priority goal."
        ],
        in3Months: [
          "Increase your monthly SIP by 10% to 15% using part of the bonus as a permanent step-up.",
          "Review whether your emergency fund has crossed the target threshold."
        ],
        in12Months: [
          "Repeat the same bonus split next year unless a major life event changes your cash-flow needs.",
          "Track whether the bonus accelerated your goal timeline in practice."
        ]
      };
    }

    case "marriage": {
      const weddingBudget = getNumber(input.answers.weddingBudget);
      const monthsToWedding = Math.max(getNumber(input.answers.monthsToWedding), 1);
      const requiredMonthlyBuffer = weddingBudget / monthsToWedding;

      return {
        emergencyFundChange: `Move your emergency target to at least ₹${Math.round(monthlySafetyNeed * 9).toLocaleString("en-IN")} after marriage.`,
        allocationUpdate: `Use low-volatility debt or arbitrage funds for money needed within ${monthsToWedding} months; avoid equity for the wedding corpus.`,
        insuranceAndTaxNote: "Review family floater health insurance, nominee details, and whether a joint HRA or home-loan strategy may emerge after marriage.",
        now: [
          `Set aside about ₹${Math.round(requiredMonthlyBuffer).toLocaleString("en-IN")} per month for the wedding corpus.`,
          "Freeze lifestyle upgrades until one-time wedding costs are fully mapped.",
          "Discuss debt, dependents, and financial goals with your partner early."
        ],
        in3Months: [
          "Create a post-marriage budget with rent, travel, gifting, and insurance premiums.",
          "Start a joint goal account or sinking fund for near-term shared expenses."
        ],
        in12Months: [
          "Shift from event planning to a joint wealth plan covering emergency fund, SIPs, and tax optimization.",
          "Rebalance term and health cover based on combined responsibilities."
        ]
      };
    }

    case "new_baby": {
      const childcareMonthly = getNumber(input.answers.childcareMonthly);
      const deliveryCost = getNumber(input.answers.deliveryCost);
      const oneTimeSetup = getNumber(input.answers.oneTimeSetup);

      return {
        emergencyFundChange: `Increase your emergency reserve to 9 to 12 months because monthly needs may rise by ₹${childcareMonthly.toLocaleString("en-IN")} or more.`,
        allocationUpdate: `Keep delivery and setup costs of ₹${(deliveryCost + oneTimeSetup).toLocaleString("en-IN")} in liquid or ultra-short debt funds instead of equity.`,
        insuranceAndTaxNote: "Upgrade family floater health insurance immediately and update nominee and guardian details for all accounts.",
        now: [
          "Create separate buckets for hospital costs, first-year childcare, and long-term child goals.",
          "Pause non-essential discretionary spending before the delivery window."
        ],
        in3Months: [
          "Add the child to health insurance and review maternity, pediatric, and daycare expenses against the budget.",
          "Start a child education SIP only after the emergency fund is back at target."
        ],
        in12Months: [
          "Review whether a term cover increase is needed due to higher dependency risk.",
          "Document a simple family contingency plan and keep cash buffers easy to access."
        ]
      };
    }

    case "inheritance": {
      const inheritanceAmount = getNumber(input.answers.inheritanceAmount);
      const liability = getNumber(input.answers.liabilityToClear);

      return {
        emergencyFundChange: "Use the inheritance to fully fund your safety buffer before taking any fresh market risk.",
        allocationUpdate: `If inheritance is ₹${inheritanceAmount.toLocaleString("en-IN")}, clear liabilities of ₹${liability.toLocaleString("en-IN")} first, then stagger the rest into goals over 6 to 12 months.`,
        insuranceAndTaxNote: "Track documentation, nomination, and any capital-gains implications if inherited assets are sold or transferred.",
        now: [
          "Park inherited cash in a liquid instrument while you decide how to allocate it.",
          "Avoid deploying the full amount into one asset class or one-time lump sum equity."
        ],
        in3Months: [
          "Finalize debt repayment, emergency fund, and goal-based splits.",
          "Create a written investment policy so the money does not drift into ad hoc spending."
        ],
        in12Months: [
          "Check whether the inheritance materially changes your retirement timeline.",
          "Use only a controlled portion for lifestyle upgrades after core goals are covered."
        ]
      };
    }

    case "job_loss": {
      const monthsWithoutIncome = Math.max(getNumber(input.answers.monthsWithoutIncome), 1);
      const severance = getNumber(input.answers.severance);
      const essentialExpenses = Math.max(getNumber(input.answers.essentialExpenses), monthlySafetyNeed);
      const runway = (profile.emergencyFund + severance) / essentialExpenses;

      return {
        emergencyFundChange: `Your first target is survival runway. Current liquidity supports roughly ${Math.min(runway, monthsWithoutIncome).toFixed(1)} months at essential spending levels.`,
        allocationUpdate: "Stop fresh long-term equity allocation temporarily and preserve liquidity until income visibility improves.",
        insuranceAndTaxNote: "Keep health insurance uninterrupted during the transition and track severance taxation carefully.",
        now: [
          "Cut monthly spending to essentials within 72 hours.",
          "Pause optional SIPs if runway is under 6 months.",
          "Move all available cash into a clean runway tracker."
        ],
        in3Months: [
          "Restart only goal-critical SIPs if a new job is secured or runway improves.",
          "Renegotiate EMI schedules if cash stress remains elevated."
        ],
        in12Months: [
          "Rebuild a full emergency fund before resuming aggressive investing.",
          "Capture lessons from the shock and set a stronger liquidity floor."
        ]
      };
    }

    case "home_purchase": {
      const propertyCost = getNumber(input.answers.propertyCost);
      const downPayment = getNumber(input.answers.downPayment);
      const timeline = Math.max(getNumber(input.answers.timelineMonths), 1);
      const downPaymentRatio = propertyCost === 0 ? 0 : (downPayment / propertyCost) * 100;

      return {
        emergencyFundChange: "Do not exhaust your emergency fund for the down payment; keep at least 6 months of expenses untouched after the purchase.",
        allocationUpdate: `A down payment ratio of ${downPaymentRatio.toFixed(1)}% is healthier above 20%, and the property corpus should stay in low-volatility assets until purchase.`,
        insuranceAndTaxNote: "Factor in registration, interiors, and home-loan tax benefits separately instead of focusing only on EMI affordability.",
        now: [
          "Stress-test the EMI at 1% to 1.5% higher interest rates.",
          `Build a dedicated down-payment bucket over the next ${timeline} months.`
        ],
        in3Months: [
          "Compare rent-versus-buy based on your likely holding period and mobility.",
          "Avoid using high-return assumptions to justify a stretched EMI."
        ],
        in12Months: [
          "If the purchase is delayed, keep the corpus liquid and revisit affordability with updated rates.",
          "After buying, rebuild liquidity before increasing equity exposure again."
        ]
      };
    }
  }
}
