-- Update addresses for specific user accounts
-- Address: 43229 Somerset Hills Ter, Ashburn, VA 20147

-- Update brian@spotcircuit.com
UPDATE users 
SET 
  address = '43229 Somerset Hills Ter',
  city = 'Ashburn',
  state = 'VA',
  zipcode = '20147',
  updated_at = NOW()
WHERE email = 'brian@spotcircuit.com';

-- Update novahokie1998@gmail.com
UPDATE users 
SET 
  address = '43229 Somerset Hills Ter',
  city = 'Ashburn',
  state = 'VA',
  zipcode = '20147',
  updated_at = NOW()
WHERE email = 'novahokie1998@gmail.com';

-- Update info@spotcircuit.com
UPDATE users 
SET 
  address = '43229 Somerset Hills Ter',
  city = 'Ashburn',
  state = 'VA',
  zipcode = '20147',
  updated_at = NOW()
WHERE email = 'info@spotcircuit.com';

-- Verify the updates
SELECT 
  email,
  name,
  address,
  city,
  state,
  zipcode,
  updated_at
FROM users 
WHERE email IN ('brian@spotcircuit.com', 'novahokie1998@gmail.com', 'info@spotcircuit.com')
ORDER BY email;