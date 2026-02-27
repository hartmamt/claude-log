-- Create subscribers table for newsletter subscription system
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed')),
  token uuid default gen_random_uuid(),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  support_amount_cents integer,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

create index idx_subscribers_email on subscribers (email);
create index idx_subscribers_token on subscribers (token);
create index idx_subscribers_stripe on subscribers (stripe_customer_id)
  where stripe_customer_id is not null;

-- Enable RLS with no policies = no access via anon key (service role only)
alter table subscribers enable row level security;
