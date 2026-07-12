import { PricingCards } from '../_components/PricingCards';

export const metadata = {
  title: 'Pricing — Tastegraph',
  description: 'Choose your plan. Unlimited Spotify playlist posters, no watermark, all templates.',
};

export default function PricingPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Choose your plan</h1>
      <p className="text-gray-600 mb-8">Cancel anytime. 30-day money-back guarantee.</p>
      <PricingCards />
      <p className="text-sm text-gray-500 mt-8">
        Questions? Email <a href="mailto:hi@tastegraph.app" className="underline">hi@tastegraph.app</a>.
      </p>
    </main>
  );
}
