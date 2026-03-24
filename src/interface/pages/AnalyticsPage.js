import { useState } from "react";
import { buildIncomeGapMatrix } from "../../domain/analysis";
import { WORK_PROFILES } from "../../domain/planModel";
import IncomeGapMatrix from "../analytics/IncomeGapMatrix";
import Page from "../Page"

const AnalyticsPage = ({ planInput }) =>
{
    const [selectedWorkProfile, setSelectedWorkProfile] = useState(WORK_PROFILES[1]);
    const matrix = buildIncomeGapMatrix(planInput, selectedWorkProfile);

    return <Page>
        <IncomeGapMatrix
            matrix={matrix}
            onSelectWorkProfile={setSelectedWorkProfile}
            selectedWorkProfile={selectedWorkProfile}
        />
    </Page>
}

export default AnalyticsPage
