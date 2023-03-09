export function getCaseUnitPrice(caseItem) {
    // the price rate from database is based on 1M nodes.
    let priceRate = caseItem.hasOwnProperty('organizeMeshRate') ? caseItem.organizeMeshRate : 10;
    return parseFloat(priceRate);
}
export function getMonthCasePrice(monthItem) {
    const caseCost = getCaseUnitPrice(monthItem) * parseInt(monthItem.nodes) / 1000000.0;
    return isNaN(caseCost) ? 0 : caseCost;
}
export function getCasePrice(caseItem) {
    const caseCost = getCaseUnitPrice(caseItem) * parseInt(caseItem.nodeSize) / 1000000.0;
    if(isNaN(caseCost)) {
        return 0;
    }
    else {
        return caseCost;
    }
}

export function getS3Cost(monthItem) {
    return 0.1 * monthItem.s3;
}

export function  getServiceBudget(orgDetail) {
    let budget = DEFAULT_SERVICE_BUDGET;
    let serviceLevel = orgDetail.serviceLevel;
    switch (serviceLevel) {
        //TODO
        case 'Bronze':
             budget = orgDetail.bronze;
            break;
        case 'Silver':
            budget = orgDetail.silver;
            break;
        case 'Gold':
            budget = orgDetail.gold;
            break;
        default:
            budget = DEFAULT_SERVICE_BUDGET;
    }
    return budget;

}

export const DEFAULT_SERVICE_BUDGET = 99999;