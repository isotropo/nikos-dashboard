import { useEffect, useRef, useState } from "react";

const STEP = 0.5;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const roundToStep = (value, step = STEP) =>
{
    return Math.round(value / step) * step;
}

const formatCurrency = (value) =>
{
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: value % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    });
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

const ServerHourlyRangeSlider = ({
    expectedMode,
    expectedValue,
    max,
    min,
    onConservativeChange,
    onExpectedChange,
    onRangeMaxChange,
    onResetExpected,
    onStrongChange,
    strong,
    conservative,
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
    }, [draggingMarker, min, max, conservative, expectedValue, strong]);

    return <div className="ServerHourlyRangeSlider">
        <div className="ServerHourlyRangeSlider__header">
            <div>
                <h3>Server Hourly</h3>
                <p>
                    Use one shared track to place conservative, expected, and
                    strong server rates inside a visible range.
                </p>
            </div>
            <label className="InputsField">
                <span>Range Max</span>
                <div className="InputsField__inputWrap">
                    <input
                        aria-label="Server Hourly Range Max"
                        onChange={(event) => onRangeMaxChange(Number(event.target.value))}
                        step="0.5"
                        type="number"
                        value={max}
                    />
                </div>
            </label>
        </div>

        <div className="ServerHourlyRangeSlider__scale">
            <span>{formatCurrency(min)}</span>
            <span>{formatCurrency(max)}</span>
        </div>

        <div className="ServerHourlyRangeSlider__trackWrap">
            <div className="ServerHourlyRangeSlider__track" ref={trackRef}>
                <div
                    className="ServerHourlyRangeSlider__activeRange"
                    style={{
                        left: `${getPercent(conservative, min, max)}%`,
                        width: `${getPercent(strong, min, max) - getPercent(conservative, min, max)}%`,
                    }}
                />

                <div
                    className="ServerHourlyRangeSlider__marker ServerHourlyRangeSlider__marker--conservative"
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("conservative");
                    }}
                    role="slider"
                    aria-label="Server Hourly Conservative Marker"
                    aria-valuemin={min}
                    aria-valuemax={strong}
                    aria-valuenow={conservative}
                    aria-valuetext={formatCurrency(conservative)}
                    onKeyDown={buildSliderKeyHandler(conservative, onConservativeChange)}
                    style={{ left: `${getPercent(conservative, min, max)}%` }}
                    tabIndex={0}
                />

                <div
                    className={`ServerHourlyRangeSlider__marker ${
                        expectedMode === "derived"
                            ? "ServerHourlyRangeSlider__marker--expectedDerived"
                            : "ServerHourlyRangeSlider__marker--expectedManual"
                    }`}
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("expected");
                    }}
                    role="slider"
                    aria-label="Server Hourly Expected Marker"
                    aria-valuemin={conservative}
                    aria-valuemax={strong}
                    aria-valuenow={expectedValue}
                    aria-valuetext={formatCurrency(expectedValue)}
                    onKeyDown={buildSliderKeyHandler(expectedValue, onExpectedChange)}
                    style={{ left: `${getPercent(expectedValue, min, max)}%` }}
                    tabIndex={0}
                />

                <div
                    className="ServerHourlyRangeSlider__marker ServerHourlyRangeSlider__marker--strong"
                    onPointerDown={(event) =>
                    {
                        event.preventDefault();
                        setDraggingMarker("strong");
                    }}
                    role="slider"
                    aria-label="Server Hourly Strong Marker"
                    aria-valuemin={conservative}
                    aria-valuemax={max}
                    aria-valuenow={strong}
                    aria-valuetext={formatCurrency(strong)}
                    onKeyDown={buildSliderKeyHandler(strong, onStrongChange)}
                    style={{ left: `${getPercent(strong, min, max)}%` }}
                    tabIndex={0}
                />
            </div>
        </div>

        <div className="ServerHourlyRangeSlider__readoutGrid">
            <div className="ServerHourlyRangeSlider__readout">
                <span>Conservative</span>
                <strong>{formatCurrency(conservative)}</strong>
            </div>
            <div className="ServerHourlyRangeSlider__readout">
                <span>
                    Expected {expectedMode === "derived" ? "(Auto midpoint)" : "(Manual)"}
                </span>
                <strong
                    className={
                        expectedMode === "derived"
                            ? "ServerHourlyRangeSlider__readoutValue--derived"
                            : "ServerHourlyRangeSlider__readoutValue--manual"
                    }
                >
                    {formatCurrency(expectedValue)}
                </strong>
            </div>
            <div className="ServerHourlyRangeSlider__readout">
                <span>Strong</span>
                <strong>{formatCurrency(strong)}</strong>
            </div>
        </div>

        <div className="ServerHourlyRangeSlider__hiddenControls" aria-hidden="true">
            <label>
                Server Hourly Conservative Slider
                <input
                    aria-label="Server Hourly Conservative Slider"
                    max={strong}
                    min={min}
                    onChange={(event) => onConservativeChange(Number(event.target.value))}
                    step="0.5"
                    type="range"
                    value={conservative}
                />
            </label>
            <label>
                Server Hourly Expected Slider
                <input
                    aria-label="Server Hourly Expected Slider"
                    max={strong}
                    min={conservative}
                    onChange={(event) => onExpectedChange(Number(event.target.value))}
                    step="0.5"
                    type="range"
                    value={expectedValue}
                />
            </label>
            <label>
                Server Hourly Strong Slider
                <input
                    aria-label="Server Hourly Strong Slider"
                    max={max}
                    min={conservative}
                    onChange={(event) => onStrongChange(Number(event.target.value))}
                    step="0.5"
                    type="range"
                    value={strong}
                />
            </label>
        </div>

        {expectedMode === "manual" && (
            <button
                className="ServerHourlyRangeSlider__reset"
                onClick={onResetExpected}
                type="button"
            >
                Reset To Midpoint
            </button>
        )}
    </div>
}

export default ServerHourlyRangeSlider;
