session=loadSession();if(session?.access_token){afterLogin().catch(()=>{saveSession(null);auth()})}else auth();
