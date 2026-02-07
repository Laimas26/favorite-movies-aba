import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import type { Movie } from '../../types';
import cropImage from '../../utils/cropImage';
import GenreTagPicker from '../GenreTagPicker/GenreTagPicker';
import styles from './MovieForm.module.css';

interface Props {
  movie?: Movie;
  onSubmit: (data: MovieFormData) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

export interface MovieFormData {
  title: string;
  year: number;
  genres: string[];
  director: string;
  rating: number;
  notes?: string;
  imageFile?: File;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function MovieForm({ movie, onSubmit, onClose, loading, error }: Props) {
  const [title, setTitle] = useState(movie?.title ?? '');
  const [year, setYear] = useState(movie?.year ?? new Date().getFullYear());
  const [genres, setGenres] = useState<string[]>(movie?.genres ?? []);
  const [director, setDirector] = useState(movie?.director ?? '');
  const [rating, setRating] = useState(movie?.rating ?? 7);
  const [notes, setNotes] = useState(movie?.notes ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image & crop state — cropper is always visible when imageSrc exists
  const [imageSrc, setImageSrc] = useState<string | null>(
    movie?.image ? `${API_URL}/uploads/${movie.image}` : null,
  );
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const handleRemoveImage = () => {
    setImageSrc(null);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageFile: File | undefined;
    if (imageSrc && croppedAreaPixels) {
      imageFile = await cropImage(imageSrc, croppedAreaPixels);
    }

    if (genres.length === 0) return;

    onSubmit({
      title,
      year,
      genres,
      director,
      rating,
      notes: notes || undefined,
      imageFile,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {movie ? 'Edit Movie' : 'Add Movie'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Poster Image (optional)</label>
            {imageSrc ? (
              <div className={styles.cropContainer}>
                <div className={styles.cropArea}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={2 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className={styles.zoomRow}>
                  <label className={styles.zoomLabel}>Zoom</label>
                  <input
                    type="range"
                    className={styles.zoomSlider}
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={styles.uploadArea}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={styles.uploadIcon}>&#128247;</div>
                <p>Click to upload an image</p>
                <span>JPEG, PNG, WebP or GIF</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. The Shawshank Redemption"
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Year</label>
              <input
                className={styles.input}
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1888}
                max={2030}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Rating (1-10)</label>
              <input
                className={styles.input}
                type="number"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min={1}
                max={10}
                step={0.5}
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Genre</label>
            <GenreTagPicker selectedGenres={genres} onChange={setGenres} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Director</label>
            <input
              className={styles.input}
              type="text"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              required
              placeholder="e.g. Frank Darabont"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Notes (optional)</label>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your thoughts about this movie..."
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : movie ? 'Update' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
