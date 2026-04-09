'use server'

import fetchUserInfo from "./user-fetcher";
import UserInfo from "@/types/user-types";

/**
 * Validation response returned after checking a user
 */
interface ValidationResponse {
    isValid: boolean,
    user?: UserInfo,
}

/**
 * ------------------------------------------------------------
 * CUSTOMIZATION SECTION
 * ------------------------------------------------------------
 * These values define who is allowed to access the platform.
 *
 * Developers using this template should modify these lists
 * depending on their authorization requirements.
 *
 * If a list is empty → that condition will not restrict access.
 */

/**
 * Allowed AIESEC Office IDs
 *
 * Example:
 * 1626 → AIESEC International
 *
 * If empty, users from ANY office will be allowed.
 *
 * Office IDs can be found in EXPA or in this reference sheet:
 * https://docs.google.com/spreadsheets/d/1A8Epd__j7OKFO85A0JAJUZcoCuvKee3DHpn0cDafx6E/edit
 */
const ALLOWED_AIESEC_OFFICE_IDS: string[] = [];
// const ALLOWED_AIESEC_OFFICE_IDS: string[] = ["182", "5853", "6547", "6550", "5854", "1735", "6549"];

/**
 * Allowed Roles
 *
 * Example roles:
 * - MCP
 * - MCVP
 * - LCP
 * - LCVP
 *
 * If empty, users with ANY role will be allowed.
 */
const ALLOWED_ROLES: string[] = []

/**
 * validateUser
 *
 * Validates whether an authenticated user is allowed to use the platform.
 *
 * Steps:
 * 1. Fetch the user's profile using the provided access token.
 * 2. Check the user's current AIESEC positions.
 * 3. Verify that the user's office and/or role matches the allowed lists.
 *
 * @param accessToken OAuth access token received from the auth provider
 * @returns ValidationResponse containing:
 *          - isValid → whether the user is allowed
 *          - user → user profile information
 */
export default async function validateUser(accessToken: string): Promise<ValidationResponse> {
    try {
        /**
         * Fetch user profile information from EXPA
         */
        const userInfo = await fetchUserInfo(accessToken);

        /**
         * Validation Logic
         *
         * A user is considered valid if at least ONE of their
         * current positions matches the configured restrictions.
         *
         * current_positions example:
         * [
         *   {
         *     office: { id: "1626" },
         *     role: { name: "AIVP" }
         *   }
         * ]
         */

        const hasOfficeRestriction = ALLOWED_AIESEC_OFFICE_IDS.length > 0 && !ALLOWED_AIESEC_OFFICE_IDS.includes("1626");
        const hasRoleRestriction = ALLOWED_ROLES.length > 0;

        const isValid = userInfo.current_positions.some((position) => {
            const officeAllowed =
                !hasOfficeRestriction || ALLOWED_AIESEC_OFFICE_IDS.includes(position.office.id);

            const roleAllowed =
                !hasRoleRestriction || ALLOWED_ROLES.includes(position.role.name);

            return officeAllowed && roleAllowed;
        });

        /**
         * Return validation result with user info
         */
        return {isValid, user: userInfo}
    } catch (error) {

        /**
         * If user info fetch fails (invalid token, network error, etc.)
         * treat the user as unauthorized.
         */
        return {isValid: false};
    }
}