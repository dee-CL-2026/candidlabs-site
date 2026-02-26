/**
 * Monthly Deck Generator — Google Apps Script Web App
 * Receives POST from Cloudflare Worker, generates a Google Slides deck from template.
 *
 * Script Properties required:
 *   API_KEY        — shared secret (must match Worker's GAS_API_KEY)
 *   TEMPLATE_ID    — Google Slides presentation ID of the monthly deck template
 *   OUTPUT_FOLDER  — Google Drive folder ID for generated decks
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
    var month = payload.placeholders && payload.placeholders['{{MONTH}}'] ? payload.placeholders['{{MONTH}}'] : 'Unknown';
    var deckName = 'Monthly Deck - ' + month + ' - ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var copy = template.makeCopy(deckName);

    // Move to output folder if configured
    if (folderId) {
      var folder = DriveApp.getFolderById(folderId);
      folder.addFile(copy);
      DriveApp.getRootFolder().removeFile(copy);
    }

    // Open the copy and replace placeholders in all slides
    var presentation = SlidesApp.openById(copy.getId());
    var placeholders = payload.placeholders || {};

    for (var key in placeholders) {
      if (placeholders.hasOwnProperty(key)) {
        presentation.replaceAllText(key, placeholders[key] || '');
      }
    }

    presentation.saveAndClose();

    var presUrl = 'https://docs.google.com/presentation/d/' + copy.getId() + '/edit';

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      presentation_id: copy.getId(),
      presentation_url: presUrl,
      presentation_name: deckName,
      month_key: payload.month_key || null
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false, error: { code: 'INTERNAL_ERROR', message: err.message }
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true, service: 'slides-deckgen', version: '1.0.0'
  })).setMimeType(ContentService.MimeType.JSON);
}
