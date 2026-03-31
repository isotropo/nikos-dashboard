import { useCallback, useEffect, useRef, useState } from "react";

const STEP = 0.01;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundToStep = (value, step = STEP) =>
{
    return Math.round(value / step) * step;
}

const formatPercent = (value) =>
{
    return `${(value * 100).toFixed(value * 100 % 1 === 0 ? 0 : 1)}%`;
}

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
            onChange(value - STEP);
        }

        if (event.key === "ArrowRight" || event.key === "ArrowUp")
        {
            event.preventDefault();
            onChange(value + STEP);
        }
    };
}

const ServingShareRangeSlider = ({
    conservative,
    expected,
    expectedMode,
    max = 1,
    min = 0,
    onConservativeChange,
    onExpectedChange,
    onResetExpected,
    onStrongChange,
    strong,
}) =>
{
    const trackRef = useRef(null);
    const [draggingMarker, setDraggingMarker] = useState(null);

    const updateMarkerFromClientX = useCallback((markerKey, clientX) =>
    {
        if (!trackRef.current)
        {
            return;
        }

        const bounds = trackRef.current.getBoundingClientRect();
        const ratio = clamp((clientX - bounds.left) / bounds.width, 0, 1);
        const rawValue = min + (ratio * (max - min));
        const nextValue = roundToStep(rawValue);

        switch (markerKey)
        {
            case "conservative":
                onConservativeChange(nextValue);
                return;
            case "expected":
                onExpectedChange(nextValue);
                return;
            case "strong":
                onStrongChange(nextValue);
                return;
            default:
                return;
        }
    }, [max, min, onConservativeChange, onExpectedChange, onStrongChange]);

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
    }, [draggingMarker, updateMarkerFromClientX]);

    return <div className="ServingShareRangeSlider">
        <div className="ServingShareRangeSlider__header">
            <div>
                <h3>Serving Share</h3>
                <p>
                    Place conservative, expected, and strong serving-share
                    assumptions on one shared track from 0% to 100%.
                </p>
            </div>
        </div>

        <div className="ServingShareRangeSlider__scale">
            <span>{formatPercent(min)}</span>
            <span>{formatPercent(max)}</span>
        </div>

        <div className="ServingShareRangeSlider__trackWrap">
            <div className="ServingShareRangeSlider__track" ref={trackRef}>
                <div
                    className="ServingShareRangeSlider__activeRange"
                    style={{
                        left: `${getPercent(conservative, min, max)}%`,
                        width: `${getPercent(strong, min, max) - getPercent(conservative, min, max)}%`,
                    }}
                />

                <div
                    aria-label="Serving Share Conservative Marker"
                    aria-valuemax={expected}
                    aria-valuemin={min}
                    aria-valuenow={conservative}
                    aria-valuetext={formatPercent(conservative)}
                    className="ServingShareRangeSlider__marker ServingShareRangeSlider__marker--conservative"
                    onKeyDown={buildSliderKeyHandler(conservative, onConservativeChange)}
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("conservative");
                    }}
                    role="slider"
                    style={{ left: `${getPercent(conservative, min, max)}%` }}
                    tabIndex={0}
                />

                <div
                    aria-label="Serving Share Expected Marker"
                    aria-valuemax={strong}
                    aria-valuemin={conservative}
                    aria-valuenow={expected}
                    aria-valuetext={formatPercent(expected)}
                    className={`ServingShareRangeSlider__marker ${
                        expectedMode === "derived"
                            ? "ServingShareRangeSlider__marker--expectedDerived"
                            : "ServingShareRangeSlider__marker--expectedManual"
                    }`}
                    onKeyDown={buildSliderKeyHandler(expected, onExpectedChange)}
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("expected");
                    }}
                    role="slider"
                    style={{ left: `${getPercent(expected, min, max)}%` }}
                    tabIndex={0}
                />

                <div
                    aria-label="Serving Share Strong Marker"
                    aria-valuemax={max}
                    aria-valuemin={expected}
                    aria-valuenow={strong}
                    aria-valuetext={formatPercent(strong)}
                    className="ServingShareRangeSlider__marker ServingShareRangeSlider__marker--strong"
                    onKeyDown={buildSliderKeyHandler(strong, onStrongChange)}
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("strong");
                    }}
                    role="slider"
                    style={{ left: `${getPercent(strong, min, max)}%` }}
                    tabIndex={0}
                />
            </div>
        </div>

        <div className="ServingShareRangeSlider__readoutGrid">
            <div className="ServingShareRangeSlider__readout">
                <span>Conservative</span>
                <strong>{formatPercent(conservative)}</strong>
            </div>
            <div className="ServingShareRangeSlider__readout">
                <span>
                    Expected {expectedMode === "derived" ? "(Auto midpoint)" : "(Manual)"}
                </span>
                <strong
                    className={
                        expectedMode === "derived"
                            ? "ServingShareRangeSlider__readoutValue--derived"
                            : "ServingShareRangeSlider__readoutValue--manual"
                    }
                >
                    {formatPercent(expected)}
                </strong>
            </div>
            <div className="ServingShareRangeSlider__readout">
                <span>Strong</span>
                <strong>{formatPercent(strong)}</strong>
            </div>
        </div>

        {expectedMode === "manual" && (
            <button
                className="ServingShareRangeSlider__reset"
                onClick={onResetExpected}
                type="button"
            >
                Reset to midpoint
            </button>
        )}

        <div className="ServingShareRangeSlider__hiddenControls" aria-hidden="true">
            <label>
                Serving Share Conservative Slider
                <input
                    aria-label="Serving Share Conservative Slider"
                    max={expected}
                    min={min}
                    onChange={(event) => onConservativeChange(Number(event.target.value))}
                    step="0.01"
                    type="range"
                    value={conservative}
                />
            </label>
            <label>
                Serving Share Expected Slider
                <input
                    aria-label="Serving Share Expected Slider"
                    max={strong}
                    min={conservative}
                    onChange={(event) => onExpectedChange(Number(event.target.value))}
                    step="0.01"
                    type="range"
                    value={expected}
                />
            </label>
            <label>
                Serving Share Strong Slider
                <input
                    aria-label="Serving Share Strong Slider"
                    max={max}
                    min={expected}
                    onChange={(event) => onStrongChange(Number(event.target.value))}
                    step="0.01"
                    type="range"
                    value={strong}
                />
            </label>
        </div>
    </div>;
}

export default ServingShareRangeSlider;
