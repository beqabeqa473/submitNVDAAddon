# Submit NVDA add-on action

This GitHub Action streamlines the process of publishing NVDA add-ons to the official add-on store by automating the submission process.

## Inputs

### Required inputs

- **`addon_name`**:  
  The name of the NVDA add-on to be submitted.

- **`addon_version`**:  
  The version of the add-on to be submitted, following the semantic versioning scheme (e.g., `1.0.0`).

- **`token`**:  
  A GitHub Personal Access Token (PAT) with the necessary permissions to authorize the submission.

- **`download_url`**:  
  The HTTPS URL where the add-on can be downloaded. The URL must end with `.nvda-addon` and consistently point to the same file for the specified version.

### Optional inputs

- **`source_url`**:  
  The URL where the source code of the add-on can be reviewed.  
  *Default: The repository URL where the action is executed.

- **`publisher`**:  
  The name of the individual, group, or organization responsible for the add-on.  
  *Default: The repository owner.

- **`channel`**:  
  The release channel for this add-on version.  
  *Options: `stable`, `beta`, `dev`  
  *Default: `stable`

- **`license_name`**:  
  The name of the license under which the add-on is released.  
  *default: GPL v2

- **`license_url`**:  
  The URL of the license under which the add-on is released.  
  *Default: "https://www.gnu.org/licenses/gpl-2.0.html

## Outputs

- **`issue_number`**:  
  The number of the issue created for the submitted add-on.

## Example usage

```yaml
- name: Submit NVDA add-on
  id: submit_addon
  uses: beqabeqa473/submitNVDAAddon@v1
  with:
    addon_name: sampleAddon
    addon_version: "1.0.0"
    download_url: https://github.com/owner/sampleAddon/releases/download/v1.0.0/sampleAddon-1.0.0.nvda-addon
    token: ${{ secrets.USER_TOKEN }}

- name: Print Output
  id: output
  run: |
    echo "${{ steps.submit_addon.outputs.issue_number }}"
```

## Support and Donations

If you find this action useful and would like to support its continued development, consider making a donation. Your contributions help maintain and improve the project.

- **Donate via PayPal:** [https://www.paypal.me/gozaltech](https://www.paypal.me/gozaltech)
- **Donate via YooMoney:** [https://yoomoney.ru/to/4100117727255296](https://yoomoney.ru/to/4100117727255296)

Thank you for your support!
