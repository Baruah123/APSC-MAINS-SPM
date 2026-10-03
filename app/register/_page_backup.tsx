import RegistrationWizard from '@/components/registration/RegistrationWizard';
import { WizardProvider } from '@/components/registration/WizardContext';
import RegistrationHeader from '@/components/registration/RegistrationHeader';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 pb-16 px-4">
      <WizardProvider>
        <RegistrationHeader />
        <div className="w-full">
          <RegistrationWizard />
        </div>
      </WizardProvider>
    </div>
  );
}
