/*
drop table UserTracking_CSR_Metrics_Aug2024
create temp table UserTracking_CSR_Metrics_Aug2024 as
select * from SP_CFE_Prod_Reports_CSR_Metrics1('2024-07-29', '2024-08-02')

insert into UserTracking_CSR_Metrics_Aug2024 
select * from SP_CFE_Prod_Reports_CSR_Metrics1('2024-08-05', '2024-08-16')


insert into UserTracking_CSR_Metrics_Aug2024 
select * from SP_CFE_Prod_Reports_CSR_Metrics1('2024-08-19', '2024-08-30')

drop table UserTracking_CSR_Metrics_Sept2024
create temp table UserTracking_CSR_Metrics_Sept2024 as
select * from SP_CFE_Prod_Reports_CSR_Metrics1('2024-09-03', '2024-09-30')

insert into UserTracking_CSR_Metrics_Sept2024 
select * from SP_CFE_Prod_Reports_CSR_Metrics1('2024-09-09', '2024-09-13')

insert into UserTracking_CSR_Metrics_Sept2024 
select * from SP_CFE_Prod_Reports_CSR_Metrics1('2024-09-16', '2024-09-20')

insert into UserTracking_CSR_Metrics_Sept2024 
select * from SP_CFE_Prod_Reports_CSR_Metrics1('2024-09-23', '2024-09-30')

select * from UserTracking_CSR_Metrics_Sept2024 
order by rundate, userlogin

where userlogin = 'airasarno@ibm.com'
select count(*) from UserTracking_CSR_Metrics_Aug2024
select * from UserTracking_CSR_Metrics_Aug2024 
order by rundate, userlogin

select * from SP_CFE_Prod_Reports_CSR_Metrics1('2025-01-01', '2025-12-31')

select * from UserTracking_CSR_Metrics where userlogin1 = 'airasarno@ibm.com'
select * from user_metrics_contactcount where ctd_ccrid = 'airasarno@ibm.com'
select * from user_metrics_minsinCFE where userloginMIC = 'airasarno@ibm.com'

select * from cm_opt_pty_party_s where pty_fullname = 'EQUITRUST LIFE INS CO'

*/

select * from SP_CFE_Prod_Reports_CSR_Metrics1('2025-01-01', '2025-12-31')
		
DROP FUNCTION IF EXISTS SP_CFE_Prod_Reports_CSR_Metrics1(startDate varchar(20), endDate varchar(20));

-- Stored Procedure to generate Prod Reports 
CREATE OR REPLACE FUNCTION SP_CFE_Prod_Reports_CSR_Metrics1(startDate varchar(20), endDate varchar(20))
RETURNS TABLE (
	rundate citext, 
    userlogin citext, 
    userpersona citext, 
    minsincfe numeric, 
    polcusserviced numeric, 
    countofcontacts numeric
) 
AS $$
DECLARE
    currentDate DATE;
BEGIN
    RAISE NOTICE 'Starting SP_CFE_Prod_Reports_CSR_Metrics for period: % to %', startDate, endDate;

    -- Temp table to store user tracking CSR metrics
    DROP TABLE IF EXISTS UserTracking_CSR_Metrics;
    CREATE TEMP TABLE UserTracking_CSR_Metrics AS 
    SELECT 
        NULL::citext AS rundate1, 
        NULL::citext AS userlogin1, 
        NULL::citext AS userpersona1, 
        NULL::numeric AS polcusserviced1
    LIMIT 0;

    -- Temp table to store user metrics contact count
    DROP TABLE IF EXISTS user_metrics_contactcount;
    CREATE TEMP TABLE user_metrics_contactcount AS 
    SELECT 
		NULL::citext AS rundate1, 
        NULL::citext AS ctd_ccrid, 
        NULL::numeric AS contact_count
    LIMIT 0;

    -- Temp table to store user metrics mins in CFE
    DROP TABLE IF EXISTS user_metrics_minsinCFE; 
    CREATE TEMP TABLE user_metrics_minsinCFE AS 
    SELECT 
		NULL::citext AS rundate1, 
        NULL::citext AS userloginMIC, 
        NULL::numeric AS minsinCFE
    LIMIT 0;


-- Initialize the current date to startDate
    currentDate := TO_DATE(startDate, 'YYYY-MM-DD');
    RAISE NOTICE 'Initialized date: %', currentDate;

    -- Loop through each day from startDate to endDate
    LOOP
        EXIT WHEN currentDate > TO_DATE(endDate, 'YYYY-MM-DD');

        -- Insert CSR metrics for the current date
        INSERT INTO UserTracking_CSR_Metrics 
        SELECT 
            TO_CHAR(currentDate, 'YYYY-MM-DD') AS rundate1, 
            userloginPCB AS userlogin1, 
            userpersonaPCB AS userpersona1, 
            countofpoliciescustomersserviced AS polcusserviced1
        FROM SP_CFE_Prod_Reports_CSR_PolCusBrowsed(TO_CHAR(currentDate, 'YYYY-MM-DD'), TO_CHAR(currentDate, 'YYYY-MM-DD'));

        -- Insert contact count metrics for the current date
        INSERT INTO user_metrics_contactcount 
        SELECT 
            TO_CHAR(currentDate, 'YYYY-MM-DD') AS rundate1, ctd_ccrid, COUNT(*) as contact_count
        FROM Cm_Opt_Ctd_NICEContactData_S
        WHERE ctd_callopendate >= currentDate 
          AND ctd_callopendate < currentDate + INTERVAL '1 day'
        GROUP BY rundate1, ctd_ccrid;

        -- Insert mins in CFE metrics for the current date
        INSERT INTO user_metrics_minsinCFE 
        SELECT TO_CHAR(currentDate, 'YYYY-MM-DD') AS rundate1, userloginMIC, NumberofMinutesInCFE as minsinCFE
        FROM SP_CFE_Prod_Reports_CSR_MinsInCFE(TO_CHAR(currentDate, 'YYYY-MM-DD'), TO_CHAR(currentDate, 'YYYY-MM-DD'));

		RAISE NOTICE 'Processed date: %', currentDate;
        -- Increment the current date by one day
        currentDate := currentDate + INTERVAL '1 day';

    END LOOP;

    RAISE NOTICE 'Completed processing from % to %', startDate, endDate;

    -- Return the final combined result
    RETURN QUERY
    WITH combined_CSR_metrics AS (
        SELECT 
            UserTracking_CSR_Metrics.rundate1, 
            UserTracking_CSR_Metrics.userlogin1, 
            userpersona1, 
            round(user_metrics_minsinCFE.minsinCFE, 1),
            polcusserviced1, 
            contact_count
        FROM UserTracking_CSR_Metrics
		inner join user_metrics_minsinCFE on user_metrics_minsinCFE.rundate1 = UserTracking_CSR_Metrics.rundate1 
			and user_metrics_minsinCFE.userloginMIC = UserTracking_CSR_Metrics.userlogin1 
		inner join user_metrics_contactcount on user_metrics_contactcount.rundate1 = UserTracking_CSR_Metrics.rundate1
			and user_metrics_contactcount.ctd_ccrid = UserTracking_CSR_Metrics.userlogin1 
    )
    SELECT *
    FROM combined_CSR_metrics
    ORDER BY rundate, userlogin;

    RAISE NOTICE 'SP_CFE_Prod_Reports_CSR_Metrics execution completed successfully.';

END;
$$ LANGUAGE plpgsql;
