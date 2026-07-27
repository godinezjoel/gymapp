-- anon/authenticated erben EXECUTE über die implizite PUBLIC-Pseudorolle, nicht
-- über direkte Grants – das vorherige REVOKE (harden_security_advisor_findings)
-- griff deshalb nicht.
revoke execute on function public.rls_auto_enable() from public;
