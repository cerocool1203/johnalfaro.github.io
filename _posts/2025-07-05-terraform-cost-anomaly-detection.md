---
layout: single
title: "Terraforming Cost Anomaly Detection on AWS and Azure"
excerpt: "In this post, we explore how AWS and Azure enable cost anomaly detection, compare their capabilities, and demonstrate how Terraform can be used to configure alerting for each platform."
header:
  teaserlogo: /assets/images/Blog/2025-07-05/aws-azure.jpg
  teaser: /assets/images/Blog/2025-07-05/aws-azure.jpg
  image: /assets/images/splash.jpg
  og_image: /assets/images/splash.jpg
  caption: "AWS vs Azure - Cost Anomaly Detection"
gallery:
  - image_path: ''
    url: ''
    title: ''
categories:
  - Blog
tags:
  - AWS
  - Azure
  - Terraform
  - Cost Management
  - FinOps
toc_label: "Table of Content"
toc: true
toc_sticky: true
toc_icon: "chart-line"
classes: wide
---

> **TL;DR:**  
> Learn how to set up cost anomaly detection on AWS and Azure using Terraform, compare their features, and see which is best for your FinOps needs.
{: .notice--info}

---

## Introduction 🚀

Cost overruns can derail even the most well-planned cloud strategies. Fortunately, both AWS and Azure offer native capabilities for detecting cost anomalies. In this blog, I'll show how each provider approaches this challenge, highlight their pros and cons, and share how I implemented Terraform configurations to create anomaly detection alerts for both.

---

## 🟧 AWS Cost Anomaly Detection

| <span style="color:green;">✔️ Pros</span>                                 | <span style="color:red;">❌ Cons</span>                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| ML-based detection adapts over time                                      | Requires initial setup of monitors and subscriptions          |
| High granularity: monitor services, accounts, regions, or tags           | No unit cost attribution by customer or project               |
| Integrates with SNS (Slack, email, Lambda)                               | Still reactive – after cost spikes occur                      |

> **💡 Pro Tip:**  
> AWS lets you set anomaly alert thresholds using absolute dollar values or percentage increases, making it easy to tailor alerts for your business needs.
{: .notice--info}

### How it works

AWS uses machine learning models to monitor usage patterns across services, accounts, and tags. It generates alerts via Amazon SNS when anomalies are detected.

### Terraform Example

```hcl
resource "aws_ce_anomaly_monitor" "example" {
  name              = "FinOps Anomaly"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
  tags              = local.tags
}

resource "aws_ce_anomaly_subscription" "example" {
  name      = "FinOps Anomaly Alert"
  frequency = "DAILY"
  monitor_arn_list = [
    aws_ce_anomaly_monitor.example.arn
  ]
  subscriber {
    type    = "EMAIL"
    address = "me@johnalfaro.com"
  }
  threshold_expression {
    dimension {
      key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
      match_options = ["GREATER_THAN_OR_EQUAL"]
      values        = ["100"]
    }
  }
  tags = local.tags
}
```

After a couple of days, you will start receiving emails with alerts like this one:

![AWS Anomaly Alert](/assets/images/Blog/2025-07-05/awsano.jpg){: .align-center}

---

## 🟦 Azure Cost Anomaly Detection

| <span style="color:green;">✔️ Pros</span>                 | <span style="color:red;">❌ Cons</span>                  |
| --------------------------------------------------------- | ------------------------------------------------------- |
| Native integration with Cost Management                   | Max 5 alert rules per subscription                      |
| Drill-down into resource groups or subscriptions          | 36-hour delay post-usage before detection runs          |
| Uses WaveNet models for forecasting                       | Less flexible than AWS                                  |

> **ℹ️ Note:**  
> Azure anomaly detection is easy to set up and integrates with Cost Management, but alerting and automation options are limited.
{: .notice--info}

### How it works

Azure Cost Anomaly Detection is built on Microsoft's WaveNet forecasting models and analyzes daily cost usage trends against historical data (up to 60 days). It looks for unexpected spikes in costs for a subscription or a resource group by comparing forecasted vs actual usage.

### Terraform Example

More info on setting up Azure Cost Anomaly Detection can be found in the [Azure Terraform Provider documentation][azuretf].

```hcl
resource "azurerm_cost_anomaly_alert" "sub" {
  name               = "finopsanomaly"
  display_name       = "FinOps Anomaly Alert"
  subscription_id    = "/subscriptions/${data.azurerm_subscription.me.subscription_id}"
  email_subject      = "FinOps Alert - ${data.azurerm_subscription.me.display_name}"
  email_addresses    = ["me@johnalfaro.com"]
}
```

After a couple of days, you will start receiving emails with alerts like this one:

![Azure Anomaly Alert](/assets/images/Blog/2025-07-05/azano.jpg){: .align-center}

---

## 📊 Comparison Table

| Feature             | AWS                         | Azure                        |
| ------------------- | --------------------------- | ---------------------------- |
| ML Detection        | ✅ Yes                       | ✅ Yes (WaveNet)             |
| Detection Frequency | ~3x per day                 | Daily (36h delay)            |
| Alert Flexibility   | SNS, email, webhook, Lambda | Email only, 5-rule limit     |
| Granularity         | Service, region, tags, etc. | Subscription, resource group |
| Thresholds          | Absolute or percentage      | Percentage only              |
| Integration         | SNS, Lambda, EventBridge    | Cost Management only         |

---

## 🚦 What Else Can You Do With the Alerts?

### 🟧 AWS

AWS Cost Anomaly Detection integrates natively with Amazon SNS, unlocking powerful automation and downstream workflows:

- **Trigger Lambda functions:** Automate cost mitigation (e.g., resource tagging, notification routing, stopping instances).
- **Integrate with chat tools:** Use AWS Chatbot or webhooks to notify Slack, Microsoft Teams, or Amazon Chime.
- **Store alerts in S3:** Archive structured alerts for audit and trend analysis.
- **Route via EventBridge:** Enable advanced rule-based routing and cross-service workflows.

This allows for fully automated cost guardrails beyond basic email notifications.

### 🟦 Azure

Azure’s anomaly alerting is more limited, but still offers options:

- **Email notifications:** Default mechanism for anomaly alerts.
- **API polling workaround:** Use Azure Functions or Logic Apps to query anomalies via the CostManagement/anomalyDetectionResults API and act on them.

> **ℹ️ At this time, Azure does not support direct integration of anomaly detection with Action Groups.**
{: .notice--info}

---

## Summary 🎯

AWS offers more flexibility and precision in anomaly detection. Its integration with other AWS services like Lambda, Step Functions, EventBridge, and Chatbot enables more automation and cost guardrails beyond simple notifications, making it a better option for enterprise environments.

Azure, while easy to set up and integrated with Cost Management, is falling behind in practical usability. The lack of direct support for Action Groups, limited alerting mechanisms, and a tendency to produce unnecessary alerts makes the feature less actionable and noisy. As it stands, Azure’s anomaly detection alerts are not yet ideal for enterprise-grade operations in my opinion.

I hope Microsoft invests in improving this feature to make it more reliable and enterprise-ready—definitely something every FinOps team wants to have, but it’s not quite there yet.

Let me know what you think—are you using either provider’s detection service? Or maybe both? 😄

**☕ Liked this content? You can sponsor my next deep dive below!**

[![](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)

[aws]: https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/
[azure]: https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/analyze-unexpected-charges#create-an-anomaly-alert
[azuretf]: https://registry.terraform.io/providers/hashicorp/azurerm/4.35.0/docs/resources/cost_anomaly_alert
[awstf]: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ce_anomaly_subscription
