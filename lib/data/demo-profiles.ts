import type {
  Goal,
  UserProfile
} from "@/lib/types";

function isoDate() {
  return new Date().toISOString();
}

const baseGoals: Goal[] = [
  {
    id: "goal-retirement",
    title: "Retirement independence",
    targetAmount: 40000000,
    targetYear: 2055,
    priority: "high",
    type: "retirement"
  }
];

export const demoProfiles: UserProfile[] = [
  {
    id: "profile-aanya",
    name: "Aanya Sharma",
    email: "aanya@demo.in",
    password: "demo123",
    city: "Bengaluru",
    age: 28,
    maritalStatus: "single",
    dependents: 0,
    monthlyIncome: 120000,
    monthlyExpenses: 55000,
    loanEmi: 8000,
    currentSavings: 380000,
    emergencyFund: 240000,
    insuranceCoverage: {
      lifeCover: 4000000,
      healthCover: 500000,
      disabilityCover: 1500000,
      personalAccidentCover: 1500000
    },
    currentInvestments: {
      equity: 620000,
      debt: 100000,
      gold: 45000,
      cash: 70000,
      epf: 180000,
      ppf: 60000,
      nps: 40000,
      international: 35000,
      alternatives: 0
    },
    riskAppetite: "growth",
    retirementTargetAge: 50,
    taxRegimePreference: "old",
    financialGoals: [
      ...baseGoals,
      {
        id: "goal-home",
        title: "Home down payment",
        targetAmount: 3000000,
        targetYear: 2030,
        priority: "high",
        type: "home"
      },
      {
        id: "goal-japan",
        title: "Japan trip",
        targetAmount: 500000,
        targetYear: 2028,
        priority: "medium",
        type: "travel"
      }
    ],
    salaryBreakdown: {
      annualGrossSalary: 1440000,
      basicSalary: 576000,
      hraReceived: 300000,
      specialAllowance: 250000,
      bonus: 120000,
      employerPf: 69120,
      professionalTax: 2400,
      standardDeduction: 50000,
      section80c: 120000,
      section80d: 18000,
      npsEmployee: 24000,
      npsEmployer: 30000,
      homeLoanInterest: 0,
      otherDeductions: 0
    },
    onboardingCompleted: true,
    createdAt: isoDate(),
    updatedAt: isoDate()
  },
  {
    id: "profile-rohan",
    name: "Rohan Mehta",
    email: "rohan@demo.in",
    password: "demo123",
    city: "Mumbai",
    age: 34,
    maritalStatus: "married",
    dependents: 1,
    monthlyIncome: 185000,
    monthlyExpenses: 80000,
    loanEmi: 25000,
    currentSavings: 800000,
    emergencyFund: 350000,
    insuranceCoverage: {
      lifeCover: 9000000,
      healthCover: 800000,
      disabilityCover: 2000000,
      personalAccidentCover: 2000000
    },
    currentInvestments: {
      equity: 1200000,
      debt: 400000,
      gold: 120000,
      cash: 150000,
      epf: 550000,
      ppf: 200000,
      nps: 90000,
      international: 0,
      alternatives: 0
    },
    riskAppetite: "balanced",
    retirementTargetAge: 58,
    taxRegimePreference: "new",
    financialGoals: [
      ...baseGoals,
      {
        id: "goal-kids",
        title: "Child education fund",
        targetAmount: 2500000,
        targetYear: 2037,
        priority: "high",
        type: "education"
      }
    ],
    salaryBreakdown: {
      annualGrossSalary: 2220000,
      basicSalary: 888000,
      hraReceived: 420000,
      specialAllowance: 260000,
      bonus: 250000,
      employerPf: 106560,
      professionalTax: 2500,
      standardDeduction: 50000,
      section80c: 150000,
      section80d: 25000,
      npsEmployee: 50000,
      npsEmployer: 90000,
      homeLoanInterest: 180000,
      otherDeductions: 0
    },
    onboardingCompleted: true,
    createdAt: isoDate(),
    updatedAt: isoDate()
  },
  {
    id: "profile-priya",
    name: "Priya Mehta",
    email: "priya@demo.in",
    password: "demo123",
    city: "Mumbai",
    age: 32,
    maritalStatus: "married",
    dependents: 1,
    monthlyIncome: 110000,
    monthlyExpenses: 50000,
    loanEmi: 0,
    currentSavings: 450000,
    emergencyFund: 280000,
    insuranceCoverage: {
      lifeCover: 3500000,
      healthCover: 800000,
      disabilityCover: 500000,
      personalAccidentCover: 1000000
    },
    currentInvestments: {
      equity: 900000,
      debt: 150000,
      gold: 60000,
      cash: 60000,
      epf: 320000,
      ppf: 80000,
      nps: 30000,
      international: 0,
      alternatives: 0
    },
    riskAppetite: "balanced",
    retirementTargetAge: 57,
    taxRegimePreference: "new",
    financialGoals: [
      ...baseGoals,
      {
        id: "goal-upgrade",
        title: "Larger family home",
        targetAmount: 4500000,
        targetYear: 2033,
        priority: "medium",
        type: "home"
      }
    ],
    salaryBreakdown: {
      annualGrossSalary: 1320000,
      basicSalary: 528000,
      hraReceived: 240000,
      specialAllowance: 160000,
      bonus: 80000,
      employerPf: 63360,
      professionalTax: 2500,
      standardDeduction: 50000,
      section80c: 110000,
      section80d: 18000,
      npsEmployee: 0,
      npsEmployer: 0,
      homeLoanInterest: 0,
      otherDeductions: 0
    },
    onboardingCompleted: true,
    createdAt: isoDate(),
    updatedAt: isoDate()
  },
  {
    id: "profile-nikhil",
    name: "Nikhil Iyer",
    email: "nikhil@demo.in",
    password: "demo123",
    city: "Chennai",
    age: 31,
    maritalStatus: "single",
    dependents: 0,
    monthlyIncome: 250000,
    monthlyExpenses: 85000,
    loanEmi: 0,
    currentSavings: 1500000,
    emergencyFund: 900000,
    insuranceCoverage: {
      lifeCover: 15000000,
      healthCover: 1000000,
      disabilityCover: 4000000,
      personalAccidentCover: 3000000
    },
    currentInvestments: {
      equity: 3000000,
      debt: 900000,
      gold: 150000,
      cash: 200000,
      epf: 700000,
      ppf: 250000,
      nps: 150000,
      international: 400000,
      alternatives: 0
    },
    riskAppetite: "aggressive",
    retirementTargetAge: 45,
    taxRegimePreference: "new",
    financialGoals: [
      {
        id: "goal-fire",
        title: "FIRE corpus",
        targetAmount: 80000000,
        targetYear: 2040,
        priority: "high",
        type: "retirement"
      },
      {
        id: "goal-parents",
        title: "Parents medical reserve",
        targetAmount: 1000000,
        targetYear: 2028,
        priority: "high",
        type: "wealth"
      }
    ],
    salaryBreakdown: {
      annualGrossSalary: 3000000,
      basicSalary: 1200000,
      hraReceived: 480000,
      specialAllowance: 400000,
      bonus: 400000,
      employerPf: 144000,
      professionalTax: 2500,
      standardDeduction: 50000,
      section80c: 150000,
      section80d: 25000,
      npsEmployee: 50000,
      npsEmployer: 120000,
      homeLoanInterest: 0,
      otherDeductions: 0
    },
    onboardingCompleted: true,
    createdAt: isoDate(),
    updatedAt: isoDate()
  },
  {
    id: "profile-sunita",
    name: "Sunita Verma",
    email: "sunita@demo.in",
    password: "demo123",
    city: "Jaipur",
    age: 41,
    maritalStatus: "single",
    dependents: 2,
    monthlyIncome: 70000,
    monthlyExpenses: 58000,
    loanEmi: 18000,
    currentSavings: 60000,
    emergencyFund: 20000,
    insuranceCoverage: {
      lifeCover: 1000000,
      healthCover: 300000,
      disabilityCover: 0,
      personalAccidentCover: 250000
    },
    currentInvestments: {
      equity: 120000,
      debt: 30000,
      gold: 50000,
      cash: 35000,
      epf: 150000,
      ppf: 0,
      nps: 0,
      international: 0,
      alternatives: 0
    },
    riskAppetite: "conservative",
    retirementTargetAge: 60,
    taxRegimePreference: "unsure",
    financialGoals: [
      {
        id: "goal-emergency",
        title: "Emergency reserve recovery",
        targetAmount: 500000,
        targetYear: 2027,
        priority: "high",
        type: "wealth"
      },
      {
        id: "goal-education-2",
        title: "School fee buffer",
        targetAmount: 300000,
        targetYear: 2027,
        priority: "high",
        type: "education"
      }
    ],
    salaryBreakdown: {
      annualGrossSalary: 840000,
      basicSalary: 336000,
      hraReceived: 96000,
      specialAllowance: 100000,
      bonus: 20000,
      employerPf: 40320,
      professionalTax: 2400,
      standardDeduction: 50000,
      section80c: 40000,
      section80d: 10000,
      npsEmployee: 0,
      npsEmployer: 0,
      homeLoanInterest: 0,
      otherDeductions: 0
    },
    onboardingCompleted: true,
    createdAt: isoDate(),
    updatedAt: isoDate()
  },
  {
    id: "profile-kabir",
    name: "Kabir Patel",
    email: "kabir@demo.in",
    password: "demo123",
    city: "Ahmedabad",
    age: 37,
    maritalStatus: "married",
    dependents: 1,
    monthlyIncome: 165000,
    monthlyExpenses: 78000,
    loanEmi: 15000,
    currentSavings: 500000,
    emergencyFund: 280000,
    insuranceCoverage: {
      lifeCover: 8000000,
      healthCover: 1000000,
      disabilityCover: 1500000,
      personalAccidentCover: 2500000
    },
    currentInvestments: {
      equity: 1800000,
      debt: 350000,
      gold: 90000,
      cash: 80000,
      epf: 420000,
      ppf: 100000,
      nps: 50000,
      international: 220000,
      alternatives: 0
    },
    riskAppetite: "growth",
    retirementTargetAge: 55,
    taxRegimePreference: "old",
    financialGoals: [
      ...baseGoals,
      {
        id: "goal-college",
        title: "Child college fund",
        targetAmount: 4000000,
        targetYear: 2038,
        priority: "high",
        type: "education"
      }
    ],
    salaryBreakdown: {
      annualGrossSalary: 1980000,
      basicSalary: 792000,
      hraReceived: 280000,
      specialAllowance: 220000,
      bonus: 180000,
      employerPf: 95040,
      professionalTax: 2400,
      standardDeduction: 50000,
      section80c: 150000,
      section80d: 25000,
      npsEmployee: 30000,
      npsEmployer: 30000,
      homeLoanInterest: 120000,
      otherDeductions: 0
    },
    onboardingCompleted: true,
    createdAt: isoDate(),
    updatedAt: isoDate()
  }
];
