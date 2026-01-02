drop table if exists WorkType_Submission;
create temp table WorkType_Submission as 
select poh_policynumber, com_code, act_activitydate, act_description, usr_login, urt_description_i, SUBSTRING(act_description FROM 1 FOR 24) Worktype
from cm_opt_poh_policyhdr_s
inner join cm_cfg_com_company_s on com_id = poh_companyid 
inner join cm_jon_policyhdr_act_s on poh_id = poh_policyhdrid
inner join cc_opt_act_useractivity_s on poh_useractivityid = act_id 
inner join cc_opt_usr_userlogin_s on usr_id = act_userid
inner join cc_jon_userlogin_urt_s on usr_id = usr_userloginid
inner join cc_opt_urt_userrole_i on urt_id_i = usr_userroleid
and act_activitydate >= '2025-04-21'
and ( act_description like 'Process Name Change%'
OR act_description like 'Update Cash Surrender%'
OR act_description like 'Update External Exchange%'
OR act_description like 'Process Address Change%'
OR act_description like 'Process Endorsement%'
OR act_description like 'Process Assignment%'
OR act_description like 'Process Ownership Change%'
OR act_description like 'Process EAddress Change%'
OR act_description like 'Process EEndorsement%'
OR act_description like 'Process ETIRPU%'
OR act_description like 'Process Cash Loan%'
--OR act_description like '%Check amount exceeds approval limit.%'
	)
order by act_activitydate desc;


update WorkType_Submission set worktype = 'Cash Surrender' where worktype = 'Update Cash Surrender - ';
update WorkType_Submission set worktype = 'Rollover Exchange' where worktype = 'Update External Exchange';
update WorkType_Submission set worktype = 'Address Change' where worktype = 'Process Address Change f';
update WorkType_Submission set worktype = 'Name Change' where worktype = 'Process Name Change for ';
update WorkType_Submission set worktype = 'Assignment' where worktype = 'Process Assignment for -';
update WorkType_Submission set worktype = 'Ownership Change' where worktype = 'Process Ownership Change';
update WorkType_Submission set worktype = 'Endorsement' where worktype = 'Process Endorsement for ';
update WorkType_Submission set worktype = 'eAddress' where worktype = 'Process EAddress Change ';
update WorkType_Submission set worktype = 'eEndorsement' where worktype = 'Process EEndorsement for';
update WorkType_Submission set worktype = 'ETIRPU' where worktype like 'Process ETIRPU for%';
update WorkType_Submission set worktype = 'Cash Loan' where worktype like 'Process Cash Loan%';

--select poh_policynumber, com_code, act_activitydate, usr_login, urt_description_i from WorkType_Submission
--where worktype = 'Cash Surrender'
--limit 100;

select worktype, count(*) from WorkType_Submission
group by worktype
order by count(*) desc;
/*
select distinct SUBSTRING(act_description FROM 1 FOR 24) from WorkType_Submission
limit 100

select distinct SUBSTRING('Process ETIRPU for - 2025-12-09-23.16.59.899440T01, PolicyNumber - 0125636040' FROM 1 FOR 24) from WorkType_Submission
limit 100

Process Cash Loan for - 2025-12-09-23.32.10.337440T01, PolicyNumber - 0075A45269


-- By Month
select worktype, TO_CHAR(DATE_TRUNC('month', act_activitydate), 'Mon') AS month1, 
DATE_TRUNC('month', act_activitydate) AS month2, count(*) from WorkType_Submission
group by worktype, month1, month2
order by month2
order by count(*) desc;


select * from WorkType_Submission
order by act_activitydate 
limit 100

select poh_policynumber, com_code, act_activitydate, act_description, usr_login, urt_description_i, SUBSTRING(act_description FROM 1 FOR 24) Worktype
from cm_opt_poh_policyhdr_s
inner join cm_cfg_com_company_s on com_id = poh_companyid 
inner join cm_jon_policyhdr_act_s on poh_id = poh_policyhdrid
inner join cc_opt_act_useractivity_s on poh_useractivityid = act_id 
inner join cc_opt_usr_userlogin_s on usr_id = act_userid
inner join cc_jon_userlogin_urt_s on usr_id = usr_userloginid
inner join cc_opt_urt_userrole_i on urt_id_i = usr_userroleid
and act_activitydate >= '2025-04-21'
and ( act_description like 'Process CashLoan%'
--OR act_description like '%Check amount exceeds approval limit.%'
	)
order by act_activitydate desc
limit 100;
*/





