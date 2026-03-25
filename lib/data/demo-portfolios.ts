import type { PortfolioFund } from "@/lib/types";

export const demoPortfolios: Record<string, PortfolioFund[]> = {
  "aanya@demo.in": [
    {
      fundName: "Parag Parikh Flexi Cap Fund",
      category: "Equity",
      investedAmount: 350000,
      currentValue: 430000,
      expenseRatio: 0.78,
      benchmarkReturn: 13.1,
      annualizedReturn: 14.8,
      styleTags: ["flexi-cap", "core"],
      topHoldings: [
        { name: "HDFC Bank", weight: 6.2 },
        { name: "ICICI Bank", weight: 5.4 },
        { name: "Bajaj Holdings", weight: 4.6 },
        { name: "Alphabet", weight: 4.1 }
      ]
    },
    {
      fundName: "HDFC Corporate Bond Fund",
      category: "Debt",
      investedAmount: 110000,
      currentValue: 118000,
      expenseRatio: 0.62,
      benchmarkReturn: 7.4,
      annualizedReturn: 7.8,
      styleTags: ["debt", "stability"],
      topHoldings: [
        { name: "GOI 2033", weight: 8.3 },
        { name: "REC", weight: 5.8 },
        { name: "NABARD", weight: 5.4 }
      ]
    },
    {
      fundName: "Nippon India Small Cap Fund",
      category: "Equity",
      investedAmount: 90000,
      currentValue: 120000,
      expenseRatio: 0.86,
      benchmarkReturn: 15.2,
      annualizedReturn: 18.1,
      styleTags: ["small-cap", "satellite"],
      topHoldings: [
        { name: "MCX", weight: 2.4 },
        { name: "Multi Commodity Exchange", weight: 2.1 },
        { name: "Karur Vysya Bank", weight: 2.1 }
      ]
    }
  ],
  "rohan@demo.in": [
    {
      fundName: "Axis ELSS Tax Saver Fund",
      category: "Equity",
      investedAmount: 400000,
      currentValue: 470000,
      expenseRatio: 1.45,
      benchmarkReturn: 12.8,
      annualizedReturn: 12.4,
      styleTags: ["elss", "large-cap"],
      topHoldings: [
        { name: "HDFC Bank", weight: 8.1 },
        { name: "Infosys", weight: 5.3 },
        { name: "ICICI Bank", weight: 4.8 }
      ]
    },
    {
      fundName: "ICICI Prudential Equity & Debt Fund",
      category: "Hybrid",
      investedAmount: 350000,
      currentValue: 430000,
      expenseRatio: 1.2,
      benchmarkReturn: 11.2,
      annualizedReturn: 11.7,
      styleTags: ["hybrid", "balanced"],
      topHoldings: [
        { name: "HDFC Bank", weight: 4.2 },
        { name: "Reliance Industries", weight: 3.8 },
        { name: "SBI", weight: 2.9 }
      ]
    },
    {
      fundName: "Parag Parikh Flexi Cap Fund",
      category: "Equity",
      investedAmount: 500000,
      currentValue: 620000,
      expenseRatio: 0.78,
      benchmarkReturn: 13.1,
      annualizedReturn: 14.8,
      styleTags: ["flexi-cap", "core"],
      topHoldings: [
        { name: "HDFC Bank", weight: 6.2 },
        { name: "ICICI Bank", weight: 5.4 },
        { name: "Alphabet", weight: 4.1 }
      ]
    }
  ],
  "nikhil@demo.in": [
    {
      fundName: "UTI Nifty 50 Index Fund",
      category: "Equity",
      investedAmount: 900000,
      currentValue: 1120000,
      expenseRatio: 0.2,
      benchmarkReturn: 13,
      annualizedReturn: 13.2,
      styleTags: ["index", "core"],
      topHoldings: [
        { name: "HDFC Bank", weight: 10.4 },
        { name: "ICICI Bank", weight: 8.3 },
        { name: "Reliance Industries", weight: 7.9 }
      ]
    },
    {
      fundName: "Motilal Oswal Midcap Fund",
      category: "Equity",
      investedAmount: 600000,
      currentValue: 840000,
      expenseRatio: 0.74,
      benchmarkReturn: 15.4,
      annualizedReturn: 17.6,
      styleTags: ["mid-cap", "growth"],
      topHoldings: [
        { name: "Trent", weight: 5.6 },
        { name: "Cummins India", weight: 4.7 },
        { name: "Persistent Systems", weight: 4.2 }
      ]
    },
    {
      fundName: "Bharat Bond ETF",
      category: "Debt",
      investedAmount: 700000,
      currentValue: 745000,
      expenseRatio: 0.1,
      benchmarkReturn: 7.2,
      annualizedReturn: 7.4,
      styleTags: ["debt", "bond"],
      topHoldings: [
        { name: "REC", weight: 8.6 },
        { name: "PFC", weight: 7.8 },
        { name: "NHAI", weight: 5.4 }
      ]
    }
  ],
  "sunita@demo.in": [
    {
      fundName: "Aditya Birla Sun Life Frontline Equity",
      category: "Equity",
      investedAmount: 90000,
      currentValue: 110000,
      expenseRatio: 1.62,
      benchmarkReturn: 12.8,
      annualizedReturn: 10.4,
      styleTags: ["large-cap"],
      topHoldings: [
        { name: "HDFC Bank", weight: 7.1 },
        { name: "ICICI Bank", weight: 6.3 },
        { name: "Infosys", weight: 4.4 }
      ]
    },
    {
      fundName: "LIC MF Savings Fund",
      category: "Debt",
      investedAmount: 25000,
      currentValue: 28000,
      expenseRatio: 0.54,
      benchmarkReturn: 6.9,
      annualizedReturn: 6.5,
      styleTags: ["debt", "liquid"],
      topHoldings: [
        { name: "TBills", weight: 9 },
        { name: "CD", weight: 7 },
        { name: "CP", weight: 6.2 }
      ]
    }
  ],
  "kabir@demo.in": [
    {
      fundName: "Parag Parikh Flexi Cap Fund",
      category: "Equity",
      investedAmount: 500000,
      currentValue: 640000,
      expenseRatio: 0.78,
      benchmarkReturn: 13.1,
      annualizedReturn: 14.8,
      styleTags: ["flexi-cap", "core"],
      topHoldings: [
        { name: "HDFC Bank", weight: 6.2 },
        { name: "ICICI Bank", weight: 5.4 },
        { name: "Alphabet", weight: 4.1 }
      ]
    },
    {
      fundName: "Axis ELSS Tax Saver Fund",
      category: "Equity",
      investedAmount: 300000,
      currentValue: 330000,
      expenseRatio: 1.45,
      benchmarkReturn: 12.8,
      annualizedReturn: 12.4,
      styleTags: ["elss", "large-cap"],
      topHoldings: [
        { name: "HDFC Bank", weight: 8.1 },
        { name: "Infosys", weight: 5.3 },
        { name: "ICICI Bank", weight: 4.8 }
      ]
    },
    {
      fundName: "Mirae Asset Large Cap Fund",
      category: "Equity",
      investedAmount: 280000,
      currentValue: 310000,
      expenseRatio: 1.56,
      benchmarkReturn: 12.5,
      annualizedReturn: 11.9,
      styleTags: ["large-cap"],
      topHoldings: [
        { name: "HDFC Bank", weight: 8.4 },
        { name: "Reliance Industries", weight: 6.2 },
        { name: "ICICI Bank", weight: 5.9 }
      ]
    },
    {
      fundName: "Motilal Oswal Nasdaq 100 FoF",
      category: "International",
      investedAmount: 180000,
      currentValue: 220000,
      expenseRatio: 0.55,
      benchmarkReturn: 14.2,
      annualizedReturn: 15.1,
      styleTags: ["international", "growth"],
      topHoldings: [
        { name: "Apple", weight: 8.5 },
        { name: "Microsoft", weight: 7.8 },
        { name: "NVIDIA", weight: 6.1 }
      ]
    },
    {
      fundName: "SBI Small Cap Fund",
      category: "Equity",
      investedAmount: 200000,
      currentValue: 290000,
      expenseRatio: 0.78,
      benchmarkReturn: 15.3,
      annualizedReturn: 18.6,
      styleTags: ["small-cap", "satellite"],
      topHoldings: [
        { name: "Elgi Equipments", weight: 2.8 },
        { name: "Blue Star", weight: 2.6 },
        { name: "Karur Vysya Bank", weight: 2.4 }
      ]
    },
    {
      fundName: "HDFC Balanced Advantage Fund",
      category: "Hybrid",
      investedAmount: 220000,
      currentValue: 255000,
      expenseRatio: 1.12,
      benchmarkReturn: 10.8,
      annualizedReturn: 11.3,
      styleTags: ["hybrid", "risk-managed"],
      topHoldings: [
        { name: "HDFC Bank", weight: 3.2 },
        { name: "Reliance Industries", weight: 2.9 },
        { name: "ICICI Bank", weight: 2.7 }
      ]
    }
  ]
};
