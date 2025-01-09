import { render } from "solid-js/web";
import { createSignal } from "solid-js";

export const formHook = (ydoc) => ({
  selections: new Map(),
  destroyed() {
    this.selections.clear();
    const selectionMap = ydoc.getMap("selection");
    selectionMap.clear();
    console.log("Form destroyed-----");
  },
  async mounted() {
    console.log("Form mounted----");
    const [cities, setCities] = createSignal([]);
    const [isInitialized, setIsInitialized] = createSignal(false);
    const [resetTrigger, setResetTrigger] = createSignal(false);

    const airportsMap = ydoc.getMap("airports");
    // save airports list into y-indexeddb if needed
    this.handleEvent("airports", ({ airports }) => {
      if (!airportsMap.has("locations")) {
        airportsMap.set("locations", airports);
      } else {
        setCities([...airportsMap.values()][0]);
        setIsInitialized(true);
      }
    });

    // on first load, y.js detects a change
    airportsMap.observe(() => {
      const entries = [...airportsMap.values()][0];
      setCities(entries);
      setIsInitialized(true);
    });

    const _this = this;

    const { FormCities } = await import("./formCities");

    // save the stores:
    // selection (depending on the inputType) in y-indexedDB
    // local variable "selections"
    // and signal MarkedSelections
    function handleSelect({ city, country, lat, lng }, inputType) {
      const selection = {
        city,
        country,
        lat,
        lng,
        inputType,
        userID: sessionStorage.getItem("userID"),
      };

      _this.selections.set(inputType, selection);
      const selectionMap = ydoc.getMap("selection");
      selectionMap.set(inputType, selection);
    }

    // update the stores
    function handleReset() {
      const selectionMap = ydoc.getMap("selection");
      selectionMap.clear();
      _this.selections.clear();
      setResetTrigger(true);
      // Reset the trigger after a short delay
      setTimeout(() => setResetTrigger(false), 100);
    }

    // form is submitted with two inputs
    function handleSubmit(e) {
      e.preventDefault();
      if (_this.selections.size !== 2) {
        console.warn("Please select both departure and arrival cities");
        return;
      }

      const [departure, arrival] = [..._this.selections.values()];
      const flightMap = ydoc.getMap("flight");
      flightMap.set("flight", {
        departure: [departure.lat, departure.lng],
        arrival: [arrival.lat, arrival.lng],
      });
    }

    render(
      () => (
        <>
          {isInitialized() ? (
            <form onSubmit={handleSubmit}>
              <FormCities
                cities={cities()}
                onSelect={handleSelect}
                resetTrigger={resetTrigger}
                inputType="departure"
                label="Departure City"
              />
              <FormCities
                cities={cities()}
                onSelect={handleSelect}
                resetTrigger={resetTrigger}
                inputType="arrival"
                label="Arrival City"
              />
              <div class="flex gap-4 mt-4">
                <button
                  class="px-4 py-2 bg-blue-500  rounded-lg hover:bg-blue-600"
                  type="submit"
                >
                  Fly!
                </button>
                <button
                  class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  type="button"
                  onClick={handleReset}
                >
                  Reset All
                </button>
              </div>
            </form>
          ) : (
            <div class="loading">Loading airports data...</div>
          )}
        </>
      ),
      _this.el
    );
  },
});

export function RenderForm() {}

/*
this.handleEvent("push_download", ({ progress }) => {
  setProgressCount(progress);
  if (progress > 99.9) setLock(false);
});
<ProgressCircle
  width="60"
  height="60"
  progress={progressCount()}
  color="midnightblue"
/>
<button
  class="px-4 py-2 border-2 rounded-md text-midnightblue bg-bisque hover:text-bisque hover:bg-midnightblue transition-colors duration-300"
  disabled={lock()}
  onClick={handleClick}
>
  Download airports
</button>
*/
