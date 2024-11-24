export interface GoogleMapsDirectionsResponse {
  status: string;
  routes: Array<{
    legs: Array<{
      distance: {
        text: string; // e.g., "5.3 km"
        value: number; // e.g., 5300 (in meters)
      };
      duration: {
        text: string; // e.g., "15 mins"
        value: number; // e.g., 900 (in seconds)
      };
      start_address: string;
      end_address: string;
      start_location: {
        lat: number;
        lng: number;
      };
      end_location: {
        lat: number;
        lng: number;
      };
      steps: Array<{
        distance: {
          text: string;
          value: number;
        };
        duration: {
          text: string;
          value: number;
        };
        end_location: {
          lat: number;
          lng: number;
        };
        start_location: {
          lat: number;
          lng: number;
        };
        html_instructions: string;
        travel_mode: string;
      }>;
    }>;
  }>;
  geocoded_waypoints: Array<{
    geocoder_status: string;
    place_id: string;
    types: string[];
  }>;
}