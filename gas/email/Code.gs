/**
 * KAA Email Sender — Google Apps Script Web App
 * Receives POST from Cloudflare Worker, sends email via GmailApp.
 *
 * Script Properties required:
 *   API_KEY        — shared secret (must match Worker's GAS_API_KEY)
 *   SENDER_NAME    — display name for outgoing emails (default: "Candid Labs")
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Bootstrap: if API_KEY not yet set, allow one-time setup via 'setup' action
    var existingKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
    if (!existingKey && payload.action === 'setup' && payload.api_key) {
      var props = { 'API_KEY': payload.api_key };
      if (payload.sender_name) props['SENDER_NAME'] = payload.sender_name;
      PropertiesService.getScriptProperties().setProperties(props);
      return ContentService.createTextOutput(JSON.stringify({
        ok: true, message: 'Script properties configured'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Validate API key (passed as query parameter — GAS cannot read headers)
    if (!existingKey || e.parameter.key !== existingKey) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (payload.action !== 'send') {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false, error: { code: 'BAD_REQUEST', message: 'Unknown action: ' + payload.action }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!payload.to) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false, error: { code: 'VALIDATION', message: 'Missing required field: to' }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!payload.subject) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false, error: { code: 'VALIDATION', message: 'Missing required field: subject' }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var senderName = PropertiesService.getScriptProperties().getProperty('SENDER_NAME') || 'Candid Labs';

    var options = {
      name: senderName,
      htmlBody: payload.htmlBody || payload.body || ''
    };

    // Attach document if doc_id is provided
    if (payload.doc_id) {
      try {
        var file = DriveApp.getFileById(payload.doc_id);
        var pdf = file.getAs('application/pdf');
        options.attachments = [pdf];
      } catch (attachErr) {
        // Log but don't fail — send email without attachment
        Logger.log('Could not attach doc ' + payload.doc_id + ': ' + attachErr.message);
      }
    }

    GmailApp.sendEmail(payload.to, payload.subject, '', options);

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      to: payload.to,
      subject: payload.subject,
      agreement_id: payload.agreement_id || null
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false, error: { code: 'INTERNAL_ERROR', message: err.message }
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true, service: 'kaa-email', version: '1.0.0'
  })).setMimeType(ContentService.MimeType.JSON);
}
