import { type FormEvent, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export interface LocationSearchValues {
  latitude: number;
  longitude: number;
  radiusInMeters: number;
}

interface LocationSearchFormProps {
  onSubmit: (values: LocationSearchValues) => void;
}

export function LocationSearchForm({ onSubmit }: LocationSearchFormProps) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radiusInMeters, setRadiusInMeters] = useState('5000');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusInMeters: Number(radiusInMeters),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div>
        <Label htmlFor="search-latitude">Latitude</Label>
        <Input
          id="search-latitude"
          type="number"
          step="any"
          min={-90}
          max={90}
          placeholder="30.0444"
          value={latitude}
          onChange={(event) => setLatitude(event.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="search-longitude">Longitude</Label>
        <Input
          id="search-longitude"
          type="number"
          step="any"
          min={-180}
          max={180}
          placeholder="31.2357"
          value={longitude}
          onChange={(event) => setLongitude(event.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="search-radius">Radius (meters)</Label>
        <Input
          id="search-radius"
          type="number"
          min={1}
          value={radiusInMeters}
          onChange={(event) => setRadiusInMeters(event.target.value)}
          required
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
