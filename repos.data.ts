import { Repo } from '../models/repo.model';

export const INITIAL_REPOS: Repo[] = [
  {
    id: 'invoice-service',
    name: 'InvoiceService',
    description: 'Generates, validates and archives customer invoices. Owns billing line-item rules.',
    team: 'Billing',
    qaLink: 'https://qa.internal.example.com/invoice-service',
    repoLink: 'https://github.com/example-org/invoice-service',
    websiteLink: 'https://invoice-service.internal.example.com',
    appSettings: `{
  "Environment": "QA",
  "ConnectionStrings": {
    "InvoiceDb": "Server=qa-sql-01;Database=InvoiceDb;Trusted_Connection=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  },
  "InvoiceSettings": {
    "TaxRateDefault": 0.18,
    "CurrencyCode": "USD",
    "RetryOnFailure": 3
  },
  "Dependencies": {
    "PaymentGateway": "https://qa.internal.example.com/payment-gateway",
    "NotificationService": "https://qa.internal.example.com/notification-service"
  }
}`,
    appSettingsDevelopment: `{
  "Environment": "Development",
  "ConnectionStrings": {
    "InvoiceDb": "Server=localhost;Database=InvoiceDb_Dev;Trusted_Connection=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft": "Information"
    }
  },
  "InvoiceSettings": {
    "TaxRateDefault": 0.18,
    "CurrencyCode": "USD",
    "RetryOnFailure": 0
  },
  "Dependencies": {
    "PaymentGateway": "https://localhost:5002",
    "NotificationService": "https://localhost:5003"
  }
}`,
  },
  {
    id: 'payment-gateway',
    name: 'PaymentGateway',
    description: 'Routes and reconciles payments across providers. Handles retries and webhooks.',
    team: 'Payments',
    qaLink: 'https://qa.internal.example.com/payment-gateway',
    repoLink: 'https://github.com/example-org/payment-gateway',
    websiteLink: 'https://payment-gateway.internal.example.com',
    appSettings: `{
  "Environment": "QA",
  "ConnectionStrings": {
    "PaymentDb": "Server=qa-sql-02;Database=PaymentDb;Trusted_Connection=True;"
  },
  "Providers": {
    "Primary": "Stripe",
    "Fallback": "Adyen",
    "TimeoutMs": 8000
  },
  "Webhooks": {
    "SigningSecret": "whsec_qa_placeholder",
    "RetryAttempts": 5
  }
}`,
    appSettingsDevelopment: `{
  "Environment": "Development",
  "ConnectionStrings": {
    "PaymentDb": "Server=localhost;Database=PaymentDb_Dev;Trusted_Connection=True;"
  },
  "Providers": {
    "Primary": "Stripe-Sandbox",
    "Fallback": "Adyen-Sandbox",
    "TimeoutMs": 30000
  },
  "Webhooks": {
    "SigningSecret": "whsec_dev_placeholder",
    "RetryAttempts": 1
  }
}`,
  },
  {
    id: 'user-auth-service',
    name: 'UserAuthService',
    description: 'Issues and verifies auth tokens, manages sessions and role-based permissions.',
    team: 'Platform',
    qaLink: 'https://qa.internal.example.com/user-auth-service',
    repoLink: 'https://github.com/example-org/user-auth-service',
    websiteLink: 'https://user-auth-service.internal.example.com',
    appSettings: `{
  "Environment": "QA",
  "Jwt": {
    "Issuer": "launchpad-auth-qa",
    "Audience": "internal-services",
    "ExpiryMinutes": 60
  },
  "ConnectionStrings": {
    "AuthDb": "Server=qa-sql-03;Database=AuthDb;Trusted_Connection=True;"
  },
  "PasswordPolicy": {
    "MinLength": 10,
    "RequireSymbol": true
  }
}`,
    appSettingsDevelopment: `{
  "Environment": "Development",
  "Jwt": {
    "Issuer": "launchpad-auth-dev",
    "Audience": "internal-services",
    "ExpiryMinutes": 1440
  },
  "ConnectionStrings": {
    "AuthDb": "Server=localhost;Database=AuthDb_Dev;Trusted_Connection=True;"
  },
  "PasswordPolicy": {
    "MinLength": 6,
    "RequireSymbol": false
  }
}`,
  },
  {
    id: 'notification-service',
    name: 'NotificationService',
    description: 'Sends email, SMS and push notifications. Templates and delivery tracking.',
    team: 'Platform',
    qaLink: 'https://qa.internal.example.com/notification-service',
    repoLink: 'https://github.com/example-org/notification-service',
    websiteLink: 'https://notification-service.internal.example.com',
    appSettings: `{
  "Environment": "QA",
  "Providers": {
    "Email": "SendGrid",
    "Sms": "Twilio",
    "Push": "Firebase"
  },
  "RateLimits": {
    "EmailPerMinute": 500,
    "SmsPerMinute": 100
  },
  "Templates": {
    "DefaultLocale": "en-US"
  }
}`,
    appSettingsDevelopment: `{
  "Environment": "Development",
  "Providers": {
    "Email": "SendGrid-Sandbox",
    "Sms": "Twilio-Test",
    "Push": "Firebase-Dev"
  },
  "RateLimits": {
    "EmailPerMinute": 10000,
    "SmsPerMinute": 10000
  },
  "Templates": {
    "DefaultLocale": "en-US"
  }
}`,
  },
  {
    id: 'order-management',
    name: 'OrderManagement',
    description: 'Tracks order lifecycle from cart to fulfillment. Publishes order-state events.',
    team: 'Commerce',
    qaLink: 'https://qa.internal.example.com/order-management',
    repoLink: 'https://github.com/example-org/order-management',
    websiteLink: 'https://order-management.internal.example.com',
    appSettings: `{
  "Environment": "QA",
  "ConnectionStrings": {
    "OrderDb": "Server=qa-sql-04;Database=OrderDb;Trusted_Connection=True;"
  },
  "EventBus": {
    "Broker": "Kafka",
    "Topic": "order-state-events"
  },
  "Dependencies": {
    "InvoiceService": "https://qa.internal.example.com/invoice-service",
    "PaymentGateway": "https://qa.internal.example.com/payment-gateway"
  }
}`,
    appSettingsDevelopment: `{
  "Environment": "Development",
  "ConnectionStrings": {
    "OrderDb": "Server=localhost;Database=OrderDb_Dev;Trusted_Connection=True;"
  },
  "EventBus": {
    "Broker": "Kafka-Local",
    "Topic": "order-state-events-dev"
  },
  "Dependencies": {
    "InvoiceService": "https://localhost:5001",
    "PaymentGateway": "https://localhost:5002"
  }
}`,
  },
  {
    id: 'inventory-service',
    name: 'InventoryService',
    description: 'Maintains stock levels across warehouses and reserves inventory on checkout.',
    team: 'Commerce',
    qaLink: 'https://qa.internal.example.com/inventory-service',
    repoLink: 'https://github.com/example-org/inventory-service',
    websiteLink: 'https://inventory-service.internal.example.com',
    appSettings: `{
  "Environment": "QA",
  "ConnectionStrings": {
    "InventoryDb": "Server=qa-sql-05;Database=InventoryDb;Trusted_Connection=True;"
  },
  "Warehouses": {
    "DefaultRegion": "US-EAST",
    "SyncIntervalMinutes": 15
  }
}`,
    appSettingsDevelopment: `{
  "Environment": "Development",
  "ConnectionStrings": {
    "InventoryDb": "Server=localhost;Database=InventoryDb_Dev;Trusted_Connection=True;"
  },
  "Warehouses": {
    "DefaultRegion": "US-EAST",
    "SyncIntervalMinutes": 1
  }
}`,
  },
];
