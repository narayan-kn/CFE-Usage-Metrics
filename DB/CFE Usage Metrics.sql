-- Report of Back Office Users with the number of policies serviced for the given date range
select * from SP_CFE_Prod_Reports_Active_BO1('2025-08-01', '2025-08-05')

-- Report of User Personas with the number of policies serviced for the given date range
select * from SP_CFE_Prod_Reports_CSR_Browse1('2025-08-01', '2025-08-05')