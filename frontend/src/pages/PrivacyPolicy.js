import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = ({ onBack }) => {
  const Section = ({ number, title, children }) => (
    <div className="mb-6">
      <h3 className="text-base font-bold text-slate-800 mb-2">
        {number}. {title}
      </h3>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="bg-[#025864] px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-[#00D47E] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Privacy Policy & EULA</h1>
            <p className="text-[#00D47E] text-xs mt-0.5">i-RAMS — Intelligent Road Asset Management System</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-xs text-slate-400 mb-8">Last updated: March 2026</p>

        <Section number={1} title="Purpose of the System">
          <p>
            i-RAMS (Intelligent Road Asset Management System) is a web-based decision-support tool
            designed to assist district engineers and government officials in prioritising feeder road
            maintenance in Bugesera District, Rwanda. The system integrates geospatial road network
            data, population data, and infrastructure data to generate a ranked list of road segments
            based on a Multi-Criteria Analysis (MCA) algorithm.
          </p>
        </Section>

        <Section number={2} title="Data Collected from Users">
          <p>
            The system collects and stores the following user data upon account creation: full name,
            email address, password (stored in hashed form), and assigned user role (Senior Engineer,
            District Engineer, or Survey Agent). No public registration is available. Accounts are
            created exclusively by system administrators for authorised government personnel.
          </p>
        </Section>

        <Section number={3} title="How User Data Is Used">
          <p>
            User data is used solely for authentication and access control purposes. Email and
            password are used to verify identity and issue a JSON Web Token (JWT) for session
            management. User role determines which system features are accessible. No user data is
            shared with third parties, used for marketing, or processed for any purpose beyond
            system access.
          </p>
        </Section>

        <Section number={4} title="Government and Geospatial Data">
          <p>
            The system processes the following government and open-source datasets: MININFRA district
            road network shapefiles, WorldPop population density rasters, MININFRA health facility
            and school location shapefiles, and road segment sole-access classification data. These
            datasets are used exclusively for calculating road maintenance priority scores. The system
            does not modify the original source data. All geospatial data is stored in a PostgreSQL
            database with the PostGIS extension.
          </p>
        </Section>

        <Section number={5} title="Data Storage and Hosting">
          <p>
            The system is currently hosted on Microsoft Azure App Service, with the database on Azure
            Database for PostgreSQL Flexible Server. Data is stored on servers outside Rwanda. For any
            future institutional deployment, compliance with Rwanda's National Data Revolution Policy
            (2017), which requires critical government data to be hosted in a national data centre,
            would need to be evaluated and formal authorisation obtained if foreign hosting is to
            continue.
          </p>
        </Section>

        <Section number={6} title="Access Control">
          <p>
            Access to the system is restricted to registered users only. The system enforces
            role-based access control: Senior Engineers have full access including algorithm weight
            configuration and network recalculation. District Engineers have read access to the
            dashboard, map, and inventory. Survey Agents have access to data entry functions. All API
            endpoints that modify system data require JWT authentication.
          </p>
        </Section>

        <Section number={7} title="Algorithm Transparency">
          <p>
            The MCA algorithm used to generate priority scores operates on a fully transparent basis.
            All weights, sub-weights, scoring thresholds, and the formula itself are visible to users
            through the configuration interface. The Live Formula Preview displays the current scoring
            logic in real time. Any changes to algorithm weights made by a Senior Engineer take effect
            only after the configuration is saved and a network recalculation is triggered.
          </p>
        </Section>

        <Section number={8} title="Data Accuracy and Limitations">
          <p>
            Users must be aware of the following limitations. The Damage Density Index (DDI) scores
            currently used in the MCA calculation are simulated values assigned for demonstration
            purposes. They do not reflect verified field survey data. The road network dataset
            includes only District Road Class 1 and Class 2 segments. Unclassified roads are not
            included in the system. Infrastructure data (health facilities and schools) is limited to
            what is documented in MININFRA shapefiles. Undocumented or informal facilities are not
            captured. Priority rankings generated by the system should not be treated as final
            operational decisions without verification of all input data sources.
          </p>
        </Section>

        <Section number={9} title="User Responsibilities">
          <p>
            By accessing this system, users agree to use it solely for its intended purpose of road
            maintenance planning and decision support. Users must not share their login credentials
            with unauthorised individuals. Users with Senior Engineer access must exercise their
            weight configuration privileges responsibly and in accordance with institutional policy.
            Users acknowledge the data limitations described in Section 8 and accept responsibility
            for verifying inputs before acting on the system's outputs.
          </p>
        </Section>

        <Section number={10} title="Changes to This Policy">
          <p>
            This policy may be updated as the system evolves. Users will be notified of material
            changes through the system interface. Continued use of the system after changes are
            posted constitutes acceptance of the updated terms.
          </p>
        </Section>

        <Section number={11} title="Contact">
          <p>
            For questions regarding this policy or the system's data practices, contact the system
            administrator or the project lead at the African Leadership University.
          </p>
        </Section>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            © 2026 i-RAMS — African Leadership University
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;