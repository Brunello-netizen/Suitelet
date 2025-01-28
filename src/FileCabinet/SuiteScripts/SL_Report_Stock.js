/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/ui/serverWidget", "N/search", "N/log", "N/record"], (serverWidget, search, log, record) => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  var onRequest = (scriptContext) => {
    var { request, response } = scriptContext;
    var SL_Form = serverWidget.createForm({ title: "GR Stock Report" }); // Create the form
    // Populates the dropdown with available locations
    var SL_LocationField = SL_Form.addField({ id: "custpage_location_select", type: serverWidget.FieldType.SELECT, label: "Inventory Location", source: "location" });
    // Add the Sublist to display stock data
    var SL_Sub_List = SL_Form.addSublist({ id: "custpage_stock_report", type: serverWidget.SublistType.LIST, label: "GR Stock Report" });
    // Add the Total Count
    var SL_RecordCountLabel = SL_Form.addField({
      id: "custpage_record_count",
      type: serverWidget.FieldType.INLINEHTML, // Use INLINEHTML to format as plain text
      label: "Total Records",
    });
    //SubList Field Configs(ID, Type, Label)
    var SL_FieldConfigs = [
      { id: "custpage_itemid", type: serverWidget.FieldType.TEXT, label: "Item", default: "N/A" },
      { id: "custpage_internalid", type: serverWidget.FieldType.TEXT, label: "Item Internal ID", default: "N/A" },
      { id: "custpage_description", type: serverWidget.FieldType.TEXT, label: "Description", default: "No Description" },
      { id: "custpage_location", type: serverWidget.FieldType.TEXT, label: "Location", default: " " },
      { id: "custpage_lotnumber", type: serverWidget.FieldType.TEXT, label: "Lot Number", default: " " },
      { id: "custpage_qtyonhand", type: serverWidget.FieldType.FLOAT, label: "Quantity on Hand", default: "0" },
      { id: "custpage_qtyavailable", type: serverWidget.FieldType.FLOAT, label: "Quantity Available", default: "0" },
    ];

    var SL_SearchColumns = ["itemid", "internalid", "description", "serialnumber", "locationquantityavailable", "locationquantityonhand"];

    SL_Form.addSubmitButton({ label: "Export" }); // Add a Submit Button
    // Define field configurations in an array
    SL_FieldConfigs.forEach((field) => {
      SL_Sub_List.addField({
        id: field.id,
        type: field.type,
        label: field.label,
      });
    });

    // Perform the Search
    var locationAvaiableFilter = [];
    if (request.method == "GET") {
    } else if (request.method == "POST") {
      var selectedLocation = scriptContext.request.parameters.custpage_location_select;
      SL_LocationField.defaultValue = selectedLocation;
      if (selectedLocation) {
        var locationRecord = record.load({
          type: "location",
          id: selectedLocation,
        });

        var locationName = locationRecord.getValue("name"); // Get the name of the location
        // Now, create a search and filter by location name
        locationAvaiableFilter = ["inventoryLocation.name", "is", locationName]; // Filter by location name
      }
    }

    // Define the search
    var itemSearch = search.create({
      type: search.Type.INVENTORY_ITEM,
      columns: [
        "itemid",
        "internalid",
        "description",
        search.createColumn({ name: "name", join: "inventoryLocation", label: "Location Name" }), // Add joined location field
        "serialnumber",
        "locationquantityavailable",
        "locationquantityonhand",
      ],
      filters: locationAvaiableFilter,
    });

    // Fetch the results
    var results = itemSearch.run().getRange({ start: 0, end: 1000 });

    // Define the search column configuration
    var SL_SearchColumnsR = [
      { name: "itemid" }, // Standard field
      { name: "internalid" }, // Standard field
      { name: "description" }, // Standard field
      { name: "name", join: "inventoryLocation" }, // Joined field
      { name: "serialnumber" }, // Standard field
      { name: "locationquantityavailable" }, // Standard field
      { name: "locationquantityonhand" }, // Standard field
    ];

    // Populate Sublist Rows
    results.forEach(function (result, index) {
      SL_FieldConfigs.forEach((config, config_index) => {
        let value;

        // Dynamically determine if the field is joined or standard

        try {
          if (config.type === "getText") {
            value =
              result.getText({
                name: SL_SearchColumnsR[config_index].name,
                join: SL_SearchColumnsR[config_index].join || null, // Use join if applicable
              }) || config.default;
          } else {
            value =
              result.getValue({
                name: SL_SearchColumnsR[config_index].name,
                join: SL_SearchColumnsR[config_index].join || null, // Use join if applicable
              }) || config.default;
          }

          // Set the sublist value if valid
          if (value !== undefined && value !== null) {
            SL_Sub_List.setSublistValue({
              id: config.id,
              line: index,
              value: value,
            });
          } else {
            log.error("Missing Value", `Field: ${config.id}, Line: ${index}`);
          }
        } catch (e) {
          log.error("Error Processing Field", `Field: ${config.id}, Error: ${e.message}`);
        }
      });
    });
    // Get the record count using runPaged
    var searchResults = itemSearch.runPaged();
    var totalCount = searchResults.count;

    // Set the value of the label field
    SL_RecordCountLabel.defaultValue = `<b>Total Records Found: ${totalCount}</b>`;
    response.writePage(SL_Form); // Add the form to the response
  };

  return { onRequest };
});
