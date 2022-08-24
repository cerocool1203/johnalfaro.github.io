---
layout: single
title: "Managing Azure NetApp Files Volume Backup feature with Terraform AzAPI Provider"
excerpt: "This article is demonstrating how to enable and create backup policies using the AzAPI Terraform provider by leveraging Terraform Cloud for it's deployment"
header:
  teaserlogo: /assets/images/Blog/2022-08-24\anfbackup.png
  teaser: /assets/images/Blog/2022-08-24\anfbackup.png
  image: /assets/images/splash.jpg
  og_image: /assets/images/splash.jpg
  caption:
gallery:
  - image_path: ''
    url: ''
    title: ''
categories:
  - Blog
tags:
  - Azure
  - Terraform
  - NetApp
  - Azure NetApp Files
  - ANF
  - TFC
toc_label: "Table of content"
toc: true
toc_sticky: true
toc_icon: "laptop-code"
classes: wide
---
[!["Buy Me A Coffee"](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)

Azure NetApp Files data protection is extending to not just snapshots but it will be able to create volume backups based on volume snapshots, so I decided to test this preview feature to understand how the backup capability will enhance the data protection posture for ANF. Currently, Backups are a preview feature and it is not enabled yet on the [Terraform AzureRM provider][azurerm]. For that reason, I decided to use the [Terraform AzAPI provider][azapi] to enable and manage this feature.

Azure NetApp Files backup provides fully managed backup solution for long-term recovery, archive, and compliance. 

- Backups created by the service are stored in Azure Storage independent of volume snapshots. IT can be Zone-Redundant Storage (ZRS) where Availability Zones are available or Local Redundant Storage (LRS) where there are no Availability Zones support.
- Backups taken by the service can be restored to new ANF volume within the region.
- Azure NetApp Files backup supports both policy-based (scheduled) backups and manual (on-demand) backups. I will be focusing on policy-based as we all like consistency.(●'◡'●)

For more information regarding this capability go to [ANF Backup documentation][anfdoc].

{{mynote}}{: .notice--info}
The diagram below depicts the architecture to be deployed for Azure NetApp Files Account.

![image-center](/assets\images\Blog\2022-08-24\anfbackup.png){: .align-center}

### Azure NetApp Files Backup Preview enablement 🕵️‍♀️
To enable the preview feature for Azure NetApp Files, you need to enable the preview feature. However, this feature needs to be requested via [Public Preview request form][preview]. When the feature is enabled this will appear as registered. 

```powershell
Get-AzProviderFeature -ProviderNamespace "Microsoft.NetApp" -ListAvailable
```
![image-center](/assets\images\Blog\2022-08-24\enabled.png){: .align-center}

{% capture mynote%}
**Note**
The pending status means that the feature needs to be enabled by Microsoft and NetApp before it can be used.
{% endcapture %}
{{mynote}}{: .notice--info}

Bonus: In case you manage providers and its features using Terraform 😞...I did try to enable this feature using terraform but it failed with the below message, which is understandable as it is an opt in feature.

```javascript
 resource "azurerm_resource_provider_registration" "anf" {
   name     = "Microsoft.NetApp"
   feature {
     name       = "ANFSDNAppliance"
     registered = true
   }
   feature {
     name       = "ANFChownMode"
     registered = true
   }
   feature {
     name       = "ANFUnixPermissions"
     registered = true
   }
   feature {
     name = "ANFBackupPreview"
     registered = true
    }
 }
```
![image-center](/assets\images\Blog\2022-08-24\tfcprev.png){: .align-center}

### Terraform Configuration 👨‍💻
I am deploying ANF using a Module with the AzureRM provider and configuring the backup preview feature using the AzAPI provider as this is an additional configuration to my last [AzApi intro article.][azpiarticle]

```java
ANF Repo
        |_Modules
            |_ANF_Pool
        |       |_ main.tf
        |       |_ variables.tf
        |       |_ outputs.tf
        |   |_ ANF_Volume
        |       |_ main.tf
        |       |_ variables.tf
        |       |_ outputs.tf        
        |_ main.tf
        |_ providers.tf
        |_ variables.tf
        |_ outputs.tf
```
### Enabling Azure NetApp Files Backups 👷
To configure ANF poicy-based backups for a volume there are some requirements. For more info about them please check [Azure NetApp Files Backup Requirements][backup_rec].

- Snapshot policy must be configured and enabled.
- There are some regions with this feature enabled.. So Australia East is one of them for my test.🦸‍♂️

```json
resource "azurerm_netapp_account" "analytics" {
  name                = "cero-netappaccount"
  location            = data.azurerm_resource_group.one.location
  resource_group_name = data.azurerm_resource_group.one.name
}

module "analytics_pools" {
  source   = "./modules/anf_pool"

  for_each = local.pools

  account_name        = azurerm_netapp_account.analytics.name
  resource_group_name = azurerm_netapp_account.analytics.resource_group_name
  location            = azurerm_netapp_account.analytics.location
  volumes             = each.value
  tags                = var.tags
}
```
After this deployment, you will be able to see the backup icon as part of the ANF account as below.
![image-center](/assets\images\Blog\2022-08-24\backupicon.png){: .align-center}

#### Backup Policy creation 📝
After testing for some time I realise the creation of the backup policy is the same as the snapshot policy, it has its own terraform resource as I was getting confused as in the portal it looks like it is part of the ANF account itself. At the end, I use the `azapi_resource` resource with the latest API version and the code looks like this:
- The parent id is the id of the ANF account.
```json
resource "azapi_resource" "backup_policy" {
  type      = "Microsoft.NetApp/netAppAccounts/backupPolicies@2022-01-01"
  parent_id = azurerm_netapp_account.analytics.id
  name      = "dailybackup"
  location  = "australiaeast"

  body = jsonencode({
    properties = {
      enabled              = true
      dailyBackupsToKeep   = 1
      weeklyBackupsToKeep  = 0
      monthlyBackupsToKeep = 0
    }
  })
}
```
Because I am deploying this in Australia East, where there is Availability Zones support. The Azure Blob will use Zone Redundant Storage (ZRS). However, I could not find anything that will provide me that information. What I did saw is that it seems to be using [NetApp Cloud Backup service][cbs] as the vault is not and Azure Backup Vault and the naming has cbs prefix🕵️♂️ and best of all it feels like CBS. In the Azure Portal (under the volume )it will look like:
![image-center](/assets\images\Blog\2022-08-24\cbs.png){: .align-center}

{% capture mynote%}
**Note**
Currently ANF backups supports backing up the daily, weekly, and monthly local snapshots created by the associated snapshot policy to the Azure storage. I hope that we can see a more granular backup policy in the future.
{% endcapture %}
{{mynote}}{: .notice--info}

![image-center](/assets\images\Blog\2022-08-24\policy.png){: .align-center}
The first snapshot when the backup feature is enabled is called a baseline snapshot, and its name includes the prefix `snapmirror`.

#### Assigning Backup Policy to an ANF Volume 📝
The next step in the process is to assign the backup policy to an ANF volume. Again, as this is not supported yet by the `AzureRM` provider I use the `azapi_update_resource` similarly to my last article. In this case, the configuration code looks like below where the data protection block is added to the volume configuration.

```powershell
resource "azapi_update_resource" "vol_backup" {
  type        = "Microsoft.NetApp/netAppAccounts/capacityPools/volumes@2021-10-01"
  resource_id = module.analytics_pools["pool1"].volumes.volume1.volume.id
  body = jsonencode({
    properties = {
      dataProtection = {
        backup = {
          backupEnabled  = true
          backupPolicyId = azapi_resource.backup_policy.id
          policyEnforced = true
        }
      }
      unixPermissions = "0740",
      exportPolicy = {
        rules = [{
          ruleIndex = 1,
          chownMode = "unRestricted" }
        ]
      }
    }

  })
}
```
The data protection policy will look like the screenshot below... So our Volume is fully protected within the region.
![image-center](/assets\images\Blog\2022-08-24\volbackup.png){: .align-center}


Something I found odd was that even though the backup policy was already "enabled" when I tried to create my first manual backup it failed, as below indicating it was not honouring accordingly the policy. The solution I found was to disable/re-enable the policy and manual backups started working. I guess is something I will be taking to provide feedback as it is still in preview😶‍🌫️.
![image-center](/assets\images\Blog\2022-08-24\failure.png){: .align-center}

### Summary 📻
I can see more adoption using these features more and more in ANF as it was missing to have a more complete Data Protection capability. In regards to the AzAPI provider, once again came to the rescue with its flexibility to provide preview features support for Azure resources. Again, I am keen to see how the `AzAPI2AzureRM` migration tool will work in this case when the features are added to the AzureRM provider and see how seamless the experience is.  I will be looking as to how can I create volumes from a backup and if there is capability to create manual backups like the manual snapshots using terraform. 
I do hope this helps someone and that you find it informative,, so please let me know your constructive feedback as it's always important🕵️‍♂️,, That's it for now,,, Hasta la vista🐱‍🏍!!!

**🚴‍♂️ If you enjoyed this blog, you can empower me with some caffeine to continue working in new content 🚴‍♂️.**

[!["Buy Me A Coffee"](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)

[azurerm]: https://registry.terraform.io/providers/hashicorp/azurerm
[azapi]: https://registry.terraform.io/providers/Azure/azapi
[azapi-provider]: https://github.com/Azure/terraform-provider-azapi
[preview]: https://forms.office.com/pages/responsepage.aspx?id=v4j5cvGGr0GRqy180BHbR2Qj2eZL0mZPv1iKUrDGvc9UMkI3NUIxVkVEVkdJMko3WllQMVRNMTdEWSQlQCN0PWcu
[vscode]: https://marketplace.visualstudio.com/items?itemName=azapi-vscode.azapi
[az2rm]: https://docs.microsoft.com/en-us/azure/developer/terraform/overview-azapi-provider#azapi2azurerm-migration-tool
[azapiarticle]: https://blog.johnalfaro.com/blog/azapi
[backup_rec]: https://docs.microsoft.com/en-us/azure/azure-netapp-files/backup-requirements-considerations
[cbs]: https://docs.netapp.com/us-en/cloud-manager-backup-restore/task-backup-to-azure.html#quick-start
[anfdoc]: https://docs.microsoft.com/en-us/azure/azure-netapp-files/backup-introduction