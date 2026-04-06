'use server'

import UserInfo from "@/types/user-types";
import axios from "axios";

/**
 * ------------------------------------------------------------
 * USER INFO FETCHER
 * ------------------------------------------------------------
 * This function retrieves the authenticated user's profile
 * information from the AIESEC GraphQL API using the access token
 * obtained during the OAuth authentication flow.
 *
 * The returned data is later used for:
 * - Authorization checks
 * - Displaying user information in the UI
 *
 * Developers using this template can modify the GraphQL query
 * to include additional user fields if required.
 */

/**
 * GraphQL query used to retrieve the authenticated user.
 *
 * You may customize this query to include additional fields
 * depending on your application's requirements.
 */
const USER_QUERY = `
{
  currentPerson {
    id
    full_name
    profile_photo
    current_positions {
      id
      office {
        id
        name
        tag
      }
      role {
        id
        name
      }
    }
  }
}
`;

/**
 * Fetch authenticated user's profile from the AIESEC GraphQL API
 *
 * @param accessToken OAuth access token received from the auth provider
 * @returns UserInfo object containing the user's profile and positions
 */
export default async function fetchUserInfo(accessToken: string): Promise<UserInfo> {

    if (!process.env.NEXT_PUBLIC_AIESEC_GRAPHQL_API) {
        throw new Error("AIESEC GraphQL API URL is not configured");
    }

    const response = await axios.post(
        process.env.NEXT_PUBLIC_AIESEC_GRAPHQL_API,
        {
            query: USER_QUERY,
        },
        {
            headers: {
                Authorization: accessToken,
            },
        }
    );

    /**
     * The API response structure looks like:
     * {
     *   data: {
     *     currentPerson: {...}
     *   }
     * }
     */
    return response.data.data.currentPerson as UserInfo;
}