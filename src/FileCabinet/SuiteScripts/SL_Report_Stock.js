/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([], () => {
  /**
   * Defines the Suitelet script trigger point.
   * @param {Object} scriptContext
   * @param {ServerRequest} scriptContext.request - Incoming request
   * @param {ServerResponse} scriptContext.response - Suitelet response
   * @since 2015.2
   */
  const onRequest = (scriptContext) => {
    const { request, response } = scriptContext;
    const form = serverWidget.createForm({
      title: "Stock Report",
    });

    const stockReport = form.addField({
      id: "custpage_stock_report",
      type: serverWidget.FieldType.INLINEHTML,
      label: "Stock Report",
    });

    const stockReportHtml = `
                <table border="1">
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                    </tr>
                    <tr>
                        <td>Item 1</td>
                        <td>100</td>
                    </tr>
                    <tr>
                        <td>Item 2</td>
                        <td>200</td>
                    </tr>
                </table>
            `;

    stockReport.defaultValue = stockReportHtml;

    response.writePage(form);
  };

  return { onRequest };
});
