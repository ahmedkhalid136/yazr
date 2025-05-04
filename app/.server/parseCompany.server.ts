import db from "@/lib/db.server_dep";
import { rawToCompanyProfile } from "./processing/newFile/rawToCompanyProfile.server";
import { JobStatus } from "@/lib/types";
// import { randomId } from "@/lib/utils";
import s3 from "@/.server/s3.server";
import { BusinessProfile } from "@/lib/typesCompany";

export const parseCompany = async (
  emailId: string,
): Promise<BusinessProfile | null> => {
  const email = await db.email.get(emailId);
  try {
    console.log("parseCompany, looking for the jobs", emailId);
    const jobs = await db.job.queryFromEmailId(emailId);

    if (!jobs || jobs.length === 0) {
      console.log("No jobs found for email", email.id);
      return null;
    }
    // if (!jobs[0].rawData) {
    //   console.log("No raw data found for job", jobs[0].id);
    //   console.log("jobs", jobs);
    //   return null;
    // }

    console.log("jobs", jobs[0].jobId);
    const companyRawData = await s3.docStoring.get(jobs[0].jobId);
    console.log("companyRawData", JSON.parse(companyRawData.toString()));
    const companyProfile = await rawToCompanyProfile(
      JSON.parse(companyRawData.toString()),
    );

    if (!companyProfile) {
      await db.job.create({ ...jobs[0], status: JobStatus.FAILED });
      console.log("Failed to parse raw data into company profile");
      return null;
    }
    // await db.companyProfile.create({
    //   ...companyProfile,
    //   emailId: email.id,
    //   companyId: randomId(),
    // });

    return companyProfile;
  } catch (error) {
    console.error("Error parsing company", error);
    return null;
  }
};
