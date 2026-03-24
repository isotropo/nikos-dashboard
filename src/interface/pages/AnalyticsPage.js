import { buildIncomeGapMatrix } from "../../domain/analysis";
import { examplePlanInput } from "../../domain/planModel";
import IncomeGapMatrix from "../analytics/IncomeGapMatrix";
import Page from "../Page"

const AnalyticsPage = () =>
{
    const matrix = buildIncomeGapMatrix(examplePlanInput);

    return <Page>
        <IncomeGapMatrix matrix={matrix} />
    </Page>
}

export default AnalyticsPage
