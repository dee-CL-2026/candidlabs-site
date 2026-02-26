/**
 * KAA Doc Generator — Google Apps Script Web App
 * Receives POST from Cloudflare Worker, generates a Google Doc from template.
 *
 * Script Properties required:
 *   API_KEY        — shared secret (must match Worker's GAS_API_KEY)
 *   TEMPLATE_ID    — Google Doc ID of the KAA agreement template
 *   OUTPUT_FOLDER  — Google Drive folder ID for generated docs
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Bootstrap: if API_KEY not yet set, allow one-time setup via 'setup' action
    var existingKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
    if (!existingKey && payload.action === 'setup' && payload.api_key) {
      var props = { 'API_KEY': payload.api_key };
      if (payload.template_id) props['TEMPLATE_ID'] = payload.template_id;
      if (payload.output_folder) props['OUTPUT_FOLDER'] = payload.output_folder;
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

    if (payload.action !== 'generate') {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false, error: { code: 'BAD_REQUEST', message: 'Unknown action: ' + payload.action }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var templateId = PropertiesService.getScriptProperties().getProperty('TEMPLATE_ID');
    if (!templateId) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false, error: { code: 'CONFIG_ERROR', message: 'TEMPLATE_ID not configured in Script Properties' }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var folderId = PropertiesService.getScriptProperties().getProperty('OUTPUT_FOLDER');

    // Copy the template
    var template = DriveApp.getFileById(templateId);
    var docName = 'KAA Agreement - ' + (payload.placeholders['<<ACCOUNT_NAME>>'] || 'Unknown') +
                  ' - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var copy = template.makeCopy(docName);

    // Move to output folder if configured
    if (folderId) {
      var folder = DriveApp.getFolderById(folderId);
      folder.addFile(copy);
      DriveApp.getRootFolder().removeFile(copy);
    }

    // Open the copy and replace placeholders
    var doc = DocumentApp.openById(copy.getId());
    var body = doc.getBody();
    var placeholders = payload.placeholders || {};

    for (var key in placeholders) {
      if (placeholders.hasOwnProperty(key)) {
        body.replaceText(escapeRegex(key), placeholders[key] || '');
      }
    }

    doc.saveAndClose();

    var docUrl = 'https://docs.google.com/document/d/' + copy.getId() + '/edit';

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      doc_id: copy.getId(),
      doc_url: docUrl,
      doc_name: docName,
      agreement_id: payload.agreement_id || null
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false, error: { code: 'INTERNAL_ERROR', message: err.message }
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true, service: 'kaa-docgen', version: '1.0.0'
  })).setMimeType(ContentService.MimeType.JSON);
}
