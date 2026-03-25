insert into app_users (id, email, password_hash, name) values
  ('11111111-1111-1111-1111-111111111111', 'aanya@demo.in', 'demo123', 'Aanya Sharma'),
  ('22222222-2222-2222-2222-222222222222', 'rohan@demo.in', 'demo123', 'Rohan Mehta'),
  ('33333333-3333-3333-3333-333333333333', 'priya@demo.in', 'demo123', 'Priya Mehta'),
  ('44444444-4444-4444-4444-444444444444', 'nikhil@demo.in', 'demo123', 'Nikhil Iyer'),
  ('55555555-5555-5555-5555-555555555555', 'sunita@demo.in', 'demo123', 'Sunita Verma'),
  ('66666666-6666-6666-6666-666666666666', 'kabir@demo.in', 'demo123', 'Kabir Patel')
on conflict (email) do nothing;

insert into profiles (
  id, user_id, city, age, marital_status, dependents, monthly_income, monthly_expenses, loan_emi, current_savings,
  emergency_fund, risk_appetite, retirement_target_age, tax_regime_preference, onboarding_completed, salary_breakdown
) values
  (
    'aaaa1111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Bengaluru', 28, 'single', 0, 120000, 55000, 8000, 380000, 240000, 'growth', 50, 'old', true,
    '{"annualGrossSalary":1440000,"basicSalary":576000,"hraReceived":300000,"bonus":120000,"employerPf":69120,"professionalTax":2400,"section80c":120000,"section80d":18000,"npsEmployee":24000,"npsEmployer":30000,"homeLoanInterest":0,"otherDeductions":0}'
  ),
  (
    'bbbb2222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Mumbai', 34, 'married', 1, 185000, 80000, 25000, 800000, 350000, 'balanced', 58, 'new', true,
    '{"annualGrossSalary":2220000,"basicSalary":888000,"hraReceived":420000,"bonus":250000,"employerPf":106560,"professionalTax":2500,"section80c":150000,"section80d":25000,"npsEmployee":50000,"npsEmployer":90000,"homeLoanInterest":180000,"otherDeductions":0}'
  ),
  (
    'cccc3333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Mumbai', 32, 'married', 1, 110000, 50000, 0, 450000, 280000, 'balanced', 57, 'new', true,
    '{"annualGrossSalary":1320000,"basicSalary":528000,"hraReceived":240000,"bonus":80000,"employerPf":63360,"professionalTax":2500,"section80c":110000,"section80d":18000,"npsEmployee":0,"npsEmployer":0,"homeLoanInterest":0,"otherDeductions":0}'
  ),
  (
    'dddd4444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Chennai', 31, 'single', 0, 250000, 85000, 0, 1500000, 900000, 'aggressive', 45, 'new', true,
    '{"annualGrossSalary":3000000,"basicSalary":1200000,"hraReceived":480000,"bonus":400000,"employerPf":144000,"professionalTax":2500,"section80c":150000,"section80d":25000,"npsEmployee":50000,"npsEmployer":120000,"homeLoanInterest":0,"otherDeductions":0}'
  ),
  (
    'eeee5555-5555-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    'Jaipur', 41, 'single', 2, 70000, 58000, 18000, 60000, 20000, 'conservative', 60, 'unsure', true,
    '{"annualGrossSalary":840000,"basicSalary":336000,"hraReceived":96000,"bonus":20000,"employerPf":40320,"professionalTax":2400,"section80c":40000,"section80d":10000,"npsEmployee":0,"npsEmployer":0,"homeLoanInterest":0,"otherDeductions":0}'
  ),
  (
    'ffff6666-6666-6666-6666-666666666666',
    '66666666-6666-6666-6666-666666666666',
    'Ahmedabad', 37, 'married', 1, 165000, 78000, 15000, 500000, 280000, 'growth', 55, 'old', true,
    '{"annualGrossSalary":1980000,"basicSalary":792000,"hraReceived":280000,"bonus":180000,"employerPf":95040,"professionalTax":2400,"section80c":150000,"section80d":25000,"npsEmployee":30000,"npsEmployer":30000,"homeLoanInterest":120000,"otherDeductions":0}'
  )
on conflict (user_id) do nothing;

insert into insurance_coverages (profile_id, life_cover, health_cover, disability_cover, personal_accident_cover) values
  ('aaaa1111-1111-1111-1111-111111111111', 4000000, 500000, 1500000, 1500000),
  ('bbbb2222-2222-2222-2222-222222222222', 9000000, 800000, 2000000, 2000000),
  ('cccc3333-3333-3333-3333-333333333333', 3500000, 800000, 500000, 1000000),
  ('dddd4444-4444-4444-4444-444444444444', 15000000, 1000000, 4000000, 3000000),
  ('eeee5555-5555-5555-5555-555555555555', 1000000, 300000, 0, 250000),
  ('ffff6666-6666-6666-6666-666666666666', 8000000, 1000000, 1500000, 2500000)
on conflict (profile_id) do nothing;

insert into investment_snapshots (profile_id, equity, debt, gold, cash, epf, ppf, nps, international, alternatives) values
  ('aaaa1111-1111-1111-1111-111111111111', 620000, 100000, 45000, 70000, 180000, 60000, 40000, 35000, 0),
  ('bbbb2222-2222-2222-2222-222222222222', 1200000, 400000, 120000, 150000, 550000, 200000, 90000, 0, 0),
  ('cccc3333-3333-3333-3333-333333333333', 900000, 150000, 60000, 60000, 320000, 80000, 30000, 0, 0),
  ('dddd4444-4444-4444-4444-444444444444', 3000000, 900000, 150000, 200000, 700000, 250000, 150000, 400000, 0),
  ('eeee5555-5555-5555-5555-555555555555', 120000, 30000, 50000, 35000, 150000, 0, 0, 0, 0),
  ('ffff6666-6666-6666-6666-666666666666', 1800000, 350000, 90000, 80000, 420000, 100000, 50000, 220000, 0)
on conflict (profile_id) do nothing;

insert into financial_goals (profile_id, title, target_amount, target_year, priority, goal_type) values
  ('aaaa1111-1111-1111-1111-111111111111', 'Home down payment', 3000000, 2030, 'high', 'home'),
  ('aaaa1111-1111-1111-1111-111111111111', 'Japan trip', 500000, 2028, 'medium', 'travel'),
  ('bbbb2222-2222-2222-2222-222222222222', 'Child education fund', 2500000, 2037, 'high', 'education'),
  ('cccc3333-3333-3333-3333-333333333333', 'Larger family home', 4500000, 2033, 'medium', 'home'),
  ('dddd4444-4444-4444-4444-444444444444', 'FIRE corpus', 80000000, 2040, 'high', 'retirement'),
  ('eeee5555-5555-5555-5555-555555555555', 'Emergency reserve recovery', 500000, 2027, 'high', 'wealth'),
  ('ffff6666-6666-6666-6666-666666666666', 'Child college fund', 4000000, 2038, 'high', 'education');

insert into portfolio_holdings (
  profile_id, fund_name, category, invested_amount, current_value, expense_ratio, benchmark_return, annualized_return, style_tags, top_holdings
) values
  (
    'ffff6666-6666-6666-6666-666666666666',
    'Parag Parikh Flexi Cap Fund', 'Equity', 500000, 640000, 0.78, 13.1, 14.8, array['flexi-cap','core'],
    '[{"name":"HDFC Bank","weight":6.2},{"name":"ICICI Bank","weight":5.4},{"name":"Alphabet","weight":4.1}]'::jsonb
  ),
  (
    'ffff6666-6666-6666-6666-666666666666',
    'Axis ELSS Tax Saver Fund', 'Equity', 300000, 330000, 1.45, 12.8, 12.4, array['elss','large-cap'],
    '[{"name":"HDFC Bank","weight":8.1},{"name":"Infosys","weight":5.3},{"name":"ICICI Bank","weight":4.8}]'::jsonb
  ),
  (
    'ffff6666-6666-6666-6666-666666666666',
    'Mirae Asset Large Cap Fund', 'Equity', 280000, 310000, 1.56, 12.5, 11.9, array['large-cap'],
    '[{"name":"HDFC Bank","weight":8.4},{"name":"Reliance Industries","weight":6.2},{"name":"ICICI Bank","weight":5.9}]'::jsonb
  );

insert into chat_messages (profile_id, role, content) values
  (
    'aaaa1111-1111-1111-1111-111111111111',
    'assistant',
    'Your biggest unlock is to raise emergency reserves and then step up your retirement SIP after your next appraisal.'
  )
on conflict do nothing;
