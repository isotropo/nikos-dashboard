import { useEffect, useRef, useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPercent = (value, min, max) =>
{
    if (max <= min)
    {
        return 0;
    }

    return ((value - min) / (max - min)) * 100;
}

const buildSliderKeyHandler = (value, onChange) =>
{
    return (event) =>
    {
        if (event.key === "ArrowLeft" || event.key === "ArrowDown")
        {
            event.preventDefault();
            onChange(value - 1);
        }

        if (event.key === "ArrowRight" || event.key === "ArrowUp")
        {
            event.preventDefault();
            onChange(value + 1);
        }
    };
}

const WorkProfilesSlider = ({
    conservative,
    expected,
    expectedMode,
    maxProfile,
    maxShifts,
    minShifts,
    onConservativeChange,
    onExpectedChange,
    onMaxProfileChange,
    onResetExpected,
}) =>
{
    const trackRef = useRef(null);
    const [draggingMarker, setDraggingMarker] = useState(null);

    const updateMarkerFromClientX = (markerKey, clientX) =>
    {
        if (!trackRef.current)
        {
            return;
        }

        const bounds = trackRef.current.getBoundingClientRect();
        const ratio = clamp((clientX - bounds.left) / bounds.width, 0, 1);
        const rawValue = minShifts + (ratio * (maxShifts - minShifts));
        const nextValue = Math.round(rawValue);

        switch (markerKey)
        {
            case "conservative":
                onConservativeChange(nextValue);
                return;
            case "expected":
                onExpectedChange(nextValue);
                return;
            case "max":
                onMaxProfileChange(nextValue);
                return;
            default:
                return;
        }
    }

    useEffect(() =>
    {
        if (!draggingMarker)
        {
            return undefined;
        }

        const handlePointerMove = (event) =>
        {
            updateMarkerFromClientX(draggingMarker, event.clientX);
        };

        const handlePointerUp = () =>
        {
            setDraggingMarker(null);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () =>
        {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [draggingMarker, minShifts, maxShifts, conservative, expected, maxProfile]);

    return <div className="WorkProfilesSlider">
        <div className="WorkProfilesSlider__header">
            <div>
                <h3>Work Volume</h3>
                <p>
                    Use one shared track to place conservative, expected, and
                    max work levels in whole shifts per week.
                </p>
            </div>
        </div>

        <div className="WorkProfilesSlider__scale">
            <span>{minShifts} shifts</span>
            <span>{maxShifts} shifts</span>
        </div>

        <div className="WorkProfilesSlider__trackWrap">
            <div className="WorkProfilesSlider__track" ref={trackRef}>
                <div
                    className="WorkProfilesSlider__activeRange"
                    style={{
                        left: `${getPercent(conservative, minShifts, maxShifts)}%`,
                        width: `${getPercent(maxProfile, minShifts, maxShifts) - getPercent(conservative, minShifts, maxShifts)}%`,
                    }}
                />

                <div
                    aria-label="Conservative Work Shifts Marker"
                    aria-valuemax={expected}
                    aria-valuemin={minShifts}
                    aria-valuenow={conservative}
                    className="WorkProfilesSlider__marker WorkProfilesSlider__marker--conservative"
                    onKeyDown={buildSliderKeyHandler(conservative, onConservativeChange)}
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("conservative");
                    }}
                    role="slider"
                    style={{ left: `${getPercent(conservative, minShifts, maxShifts)}%` }}
                    tabIndex={0}
                />

                <div
                    aria-label="Expected Work Shifts Marker"
                    aria-valuemax={maxProfile}
                    aria-valuemin={conservative}
                    aria-valuenow={expected}
                    className={`WorkProfilesSlider__marker ${
                        expectedMode === "derived"
                            ? "WorkProfilesSlider__marker--expectedDerived"
                            : "WorkProfilesSlider__marker--expectedManual"
                    }`}
                    onKeyDown={buildSliderKeyHandler(expected, onExpectedChange)}
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("expected");
                    }}
                    role="slider"
                    style={{ left: `${getPercent(expected, minShifts, maxShifts)}%` }}
                    tabIndex={0}
                />

                <div
                    aria-label="Max Work Shifts Marker"
                    aria-valuemax={maxShifts}
                    aria-valuemin={expected}
                    aria-valuenow={maxProfile}
                    className="WorkProfilesSlider__marker WorkProfilesSlider__marker--max"
                    onKeyDown={buildSliderKeyHandler(maxProfile, onMaxProfileChange)}
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("max");
                    }}
                    role="slider"
                    style={{ left: `${getPercent(maxProfile, minShifts, maxShifts)}%` }}
                    tabIndex={0}
                />
            </div>
        </div>

        <div className="WorkProfilesSlider__readoutGrid">
            <div className="WorkProfilesSlider__readout">
                <span>Conservative</span>
                <strong>{conservative} shifts/week</strong>
            </div>
            <div className="WorkProfilesSlider__readout">
                <span>
                    Expected {expectedMode === "derived" ? "(Auto midpoint)" : "(Manual)"}
                </span>
                <strong
                    className={
                        expectedMode === "derived"
                            ? "WorkProfilesSlider__readoutValue--derived"
                            : "WorkProfilesSlider__readoutValue--manual"
                    }
                >
                    {expected} shifts/week
                </strong>
            </div>
            <div className="WorkProfilesSlider__readout">
                <span>Max</span>
                <strong>{maxProfile} shifts/week</strong>
            </div>
        </div>

        <div className="WorkProfilesSlider__hiddenControls" aria-hidden="true">
            <label>
                Conservative Work Shifts Slider
                <input
                    aria-label="Conservative Work Shifts Slider"
                    max={expected}
                    min={minShifts}
                    onChange={(event) => onConservativeChange(Number(event.target.value))}
                    step="1"
                    type="range"
                    value={conservative}
                />
            </label>
            <label>
                Expected Work Shifts Slider
                <input
                    aria-label="Expected Work Shifts Slider"
                    max={maxProfile}
                    min={conservative}
                    onChange={(event) => onExpectedChange(Number(event.target.value))}
                    step="1"
                    type="range"
                    value={expected}
                />
            </label>
            <label>
                Max Work Shifts Slider
                <input
                    aria-label="Max Work Shifts Slider"
                    max={maxShifts}
                    min={expected}
                    onChange={(event) => onMaxProfileChange(Number(event.target.value))}
                    step="1"
                    type="range"
                    value={maxProfile}
                />
            </label>
        </div>

        {expectedMode === "manual" && (
            <button
                className="WorkProfilesSlider__reset"
                onClick={onResetExpected}
                type="button"
            >
                Reset To Midpoint
            </button>
        )}
    </div>
}

export default WorkProfilesSlider;
