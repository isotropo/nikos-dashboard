import { useState } from "react";
import { buildIncomeGapMatrix } from "../../domain/analysis";
import { INCOME_SCENARIOS, WORK_PROFILES } from "../../domain/planModel";
import IncomeGapMatrix from "../analytics/IncomeGapMatrix";
import Page from "../Page"

const AnalyticsPage = ({ planInput }) =>
{
    const [selectedWorkProfile, setSelectedWorkProfile] = useState(WORK_PROFILES[1]);
    const [servingShareScenarioOverride, setServingShareScenarioOverride] = useState(null);
    const matrix = buildIncomeGapMatrix(planInput, selectedWorkProfile, {
        servingShareScenario: servingShareScenarioOverride,
    });

    const toggleServingShareScenarioOverride = (scenario) =>
    {
        if (!INCOME_SCENARIOS.includes(scenario))
        {
            return;
        }

        setServingShareScenarioOverride((current) =>
            current === scenario ? null : scenario
        );
    }

    return <Page>
        <IncomeGapMatrix
            planInput={planInput}
            matrix={matrix}
            onSelectWorkProfile={setSelectedWorkProfile}
            onToggleServingShareScenarioOverride={toggleServingShareScenarioOverride}
            selectedWorkProfile={selectedWorkProfile}
            servingShareScenarioOverride={servingShareScenarioOverride}
        />
    </Page>
}

export default AnalyticsPage
