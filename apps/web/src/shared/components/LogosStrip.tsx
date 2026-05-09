import { Container } from './Container';

const logos = [
  'Hillsong Living',
  'Redeemer NY',
  'Elevation',
  'Lakewood',
  'Bethel',
  'City Harvest',
  'House on the Rock',
  'Saddleback',
];

export function LogosStrip() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <p className="text-center text-[12px] uppercase tracking-[0.16em] text-pebble">
          Trusted by churches and ministries shepherding 2M+ members
        </p>
        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 md:grid-cols-8">
          {logos.map((name) => (
            <div
              key={name}
              className="text-center font-display text-[18px] text-stone/80 grayscale"
            >
              {name}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
