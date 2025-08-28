import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { vehicleService } from "../lib/vehicleService";

const VehicleContext = createContext();

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error("useVehicles must be used within a VehicleProvider");
  }
  return context;
};

export const VehicleProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false); // Track if we've loaded initially

  const fetchVehicles = useCallback(
    async (forceRefresh = false) => {
      console.log("🔄 Fetching vehicles...");
      try {
        setLoading(true);
        setError(null);
        const userVehicles = await vehicleService.getUserVehicles();
        console.log("✅ Vehicles fetched:", userVehicles);
        setVehicles(userVehicles);
        setInitialized(true);
      } catch (err) {
        console.error("❌ Error fetching vehicles:", err);
        setError("Failed to load vehicles. Please try again.");
      } finally {
        setLoading(false);
        console.log("🏁 Fetch vehicles completed");
      }
    },
    [] // No dependencies to prevent infinite loops
  );

  const addVehicle = async (vehicleData) => {
    try {
      const newVehicle = await vehicleService.addVehicle(vehicleData);
      setVehicles((prev) => [...prev, newVehicle]);
      return { success: true, vehicle: newVehicle };
    } catch (error) {
      console.error("Error adding vehicle:", error);
      return { success: false, error };
    }
  };

  const updateVehicle = async (vehicleId, vehicleData) => {
    try {
      const updatedVehicle = await vehicleService.updateVehicle(
        vehicleId,
        vehicleData
      );
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicleId ? updatedVehicle : v))
      );
      return { success: true, vehicle: updatedVehicle };
    } catch (error) {
      console.error("Error updating vehicle:", error);
      return { success: false, error };
    }
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      await vehicleService.deleteVehicle(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      return { success: false, error };
    }
  };

  const getVehicleCount = () => vehicles.length;

  // Initial fetch when provider mounts
  useEffect(() => {
    console.log("🚀 VehicleProvider mounted, fetching vehicles...");
    fetchVehicles();
  }, [fetchVehicles]);

  const value = {
    vehicles,
    loading,
    error,
    initialized,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleCount,
  };

  return (
    <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>
  );
};
