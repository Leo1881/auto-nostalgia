/**
 * NHTSA vPIC API Service
 * Provides standardized vehicle data from the U.S. Department of Transportation
 */

const NHTSA_BASE_URL = "https://vpic.nhtsa.dot.gov/api/vehicles";

class NHTSService {
  /**
   * Fetch all vehicle makes
   * @returns {Promise<Array>} Array of vehicle makes
   */
  async getAllMakes() {
    try {
      const response = await fetch(`${NHTSA_BASE_URL}/GetAllMakes?format=json`);
      const data = await response.json();

      if (data.Results && data.Results.length > 0) {
        return data.Results.map((make) => ({
          value: make.Make_Name,
          label: make.Make_Name,
        })).sort((a, b) => a.label.localeCompare(b.label));
      }
      return [];
    } catch (error) {
      console.error("Error fetching makes:", error);
      return [];
    }
  }

  /**
   * Fetch models for a specific make
   * @param {string} make - Vehicle make
   * @returns {Promise<Array>} Array of models for the make
   */
  async getModelsForMake(make) {
    try {
      const response = await fetch(
        `${NHTSA_BASE_URL}/GetModelsForMake/${encodeURIComponent(
          make
        )}?format=json`
      );
      const data = await response.json();

      if (data.Results && data.Results.length > 0) {
        return data.Results.map((model) => ({
          value: model.Model_Name,
          label: model.Model_Name,
        })).sort((a, b) => a.label.localeCompare(b.label));
      }
      return [];
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }

  /**
   * Fetch models for a specific make and year
   * @param {string} make - Vehicle make
   * @param {number} year - Vehicle year
   * @returns {Promise<Array>} Array of models for the make and year
   */
  async getModelsForMakeYear(make, year) {
    try {
      const response = await fetch(
        `${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(
          make
        )}/modelyear/${year}?format=json`
      );
      const data = await response.json();

      if (data.Results && data.Results.length > 0) {
        return data.Results.map((model) => ({
          value: model.Model_Name,
          label: model.Model_Name,
        })).sort((a, b) => a.label.localeCompare(b.label));
      }
      return [];
    } catch (error) {
      console.error("Error fetching models for make and year:", error);
      return [];
    }
  }

  /**
   * Get vehicle years (generate a reasonable range)
   * @returns {Array} Array of years from 1900 to current year + 1
   */
  getVehicleYears() {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let year = currentYear + 1; year >= 1900; year--) {
      years.push({
        value: year.toString(),
        label: year.toString(),
      });
    }

    return years;
  }

  /**
   * Validate if a make exists in NHTSA database
   * @param {string} make - Vehicle make to validate
   * @returns {Promise<boolean>} True if make exists
   */
  async validateMake(make) {
    try {
      const makes = await this.getAllMakes();
      return makes.some((m) => m.value.toLowerCase() === make.toLowerCase());
    } catch (error) {
      console.error("Error validating make:", error);
      return false;
    }
  }

  /**
   * Validate if a model exists for a specific make
   * @param {string} make - Vehicle make
   * @param {string} model - Vehicle model to validate
   * @returns {Promise<boolean>} True if model exists for the make
   */
  async validateModel(make, model) {
    try {
      const models = await this.getModelsForMake(make);
      return models.some((m) => m.value.toLowerCase() === model.toLowerCase());
    } catch (error) {
      console.error("Error validating model:", error);
      return false;
    }
  }

  /**
   * Get vehicle specifications (if available)
   * @param {string} make - Vehicle make
   * @param {string} model - Vehicle model
   * @param {number} year - Vehicle year
   * @returns {Promise<Object>} Vehicle specifications
   */
  async getVehicleSpecs(make, model, year) {
    try {
      // This is a placeholder - NHTSA vPIC doesn't provide detailed specs
      // You might want to integrate with other APIs for detailed specifications
      return {
        make,
        model,
        year,
        source: "NHTSA vPIC API",
      };
    } catch (error) {
      console.error("Error fetching vehicle specs:", error);
      return null;
    }
  }
}

// Create and export a singleton instance
const nhtsaService = new NHTSService();
export default nhtsaService;
