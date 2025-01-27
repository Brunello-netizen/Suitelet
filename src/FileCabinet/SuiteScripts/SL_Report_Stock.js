/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/search", "N/log"], (serverWidget, search, log) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    const { request, response } = scriptContext;
    const SL_Form = serverWidget.createForm({ title: "GR Stock Report" }); // Create the form
    // Populates the dropdown with available locations
    const SL_LocationField = SL_Form.addField({ id: "custpage_location", type: serverWidget.FieldType.SELECT, label: "Inventory Location", source: "location" });
    // Add the Sublist to display stock data
    const SL_Sub_List = SL_Form.addSublist({ id: "custpage_stock_report", type: serverWidget.SublistType.LIST, label: "GR Stock Report" });
    //SubList Field Configs(ID, Type, Label)
    const SL_fieldConfigs = [
      { id: "custpage_itemid", type: serverWidget.FieldType.TEXT, label: "Item" },
      { id: "custpage_internalid", type: serverWidget.FieldType.TEXT, label: "Item Internal ID" },
      { id: "custpage_description", type: serverWidget.FieldType.TEXT, label: "Description" },
      { id: "custpage_location", type: serverWidget.FieldType.TEXT, label: "Location" },
      { id: "custpage_lotnumber", type: serverWidget.FieldType.TEXT, label: "Lot Number" },
      { id: "custpage_qtyonhand", type: serverWidget.FieldType.FLOAT, label: "Quantity on Hand" },
      { id: "custpage_qtyavailable", type: serverWidget.FieldType.FLOAT, label: "Quantity Available" },
    ];
    SL_Form.addSubmitButton({ label: "Export" }); // Add a Submit Button
    // Define field configurations in an array
    SL_fieldConfigs.forEach((field) => {
      SL_Sub_List.addField({
        id: field.id,
        type: field.type,
        label: field.label,
      });
    });

    // Perform the Search
    var filters = [];

    if (request.method == "GET") {
      log.debug("GET");
    } else if (request.method == "POST") {
      var selectedLocation = context.request.parameters.custpage_location;
      if (selectedLocation) {
        filters.push(["location", "anyof", selectedLocation]);
      }
      log.debug("POST");
    }

    var itemSearch = search.create({
      type: search.Type.INVENTORY_ITEM,
      columns: ["itemid", "internalid", "description", "location", "quantityonhand", "quantityavailable"],
      filters: filters,
    });
    var results = itemSearch.run().getRange(0, 1000);
    for (var i = 0; i < results.length; i++) {
      log.debug(results[i]);
    }

    response.writePage(SL_Form); // Add the form to the response
  };

  return { onRequest };
});
