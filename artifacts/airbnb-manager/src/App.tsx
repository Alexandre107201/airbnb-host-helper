import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/admin/Dashboard";
import Property from "@/pages/admin/Property";
import CheckinSteps from "@/pages/admin/CheckinSteps";
import CheckoutSteps from "@/pages/admin/CheckoutSteps";
import Rules from "@/pages/admin/Rules";
import Tips from "@/pages/admin/Tips";
import FAQ from "@/pages/admin/FAQ";
import Guests from "@/pages/admin/Guests";
import GuestPortal from "@/pages/guest/GuestPortal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/property" component={Property} />
      <Route path="/checkin" component={CheckinSteps} />
      <Route path="/checkout" component={CheckoutSteps} />
      <Route path="/rules" component={Rules} />
      <Route path="/tips" component={Tips} />
      <Route path="/faq" component={FAQ} />
      <Route path="/guests" component={Guests} />
      <Route path="/guest" component={GuestPortal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
