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
  haveCats?: boolean;
  imageFile?: File;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FIELD_ORDER = ['title', 'year', 'rating', 'genres', 'director'] as const;

function validate(title: string, year: number, genres: string[], director: string, rating: number) {
  const errors: Record<string, string> = {};
  if (!title.trim()) errors.title = 'Title is required';
  if (year < 1888 || year > 2030) errors.year = 'Year must be between 1888 and 2030';
  if (rating < 1 || rating > 10) errors.rating = 'Rating must be between 1 and 10';
  if (genres.length === 0) errors.genres = 'Select at least one genre';
  if (!director.trim()) errors.director = 'Director is required';
  return errors;
}

export default function MovieForm({ movie, onSubmit, onClose, loading, error }: Props) {
  const [title, setTitle] = useState(movie?.title ?? '');
  const [year, setYear] = useState(movie?.year ?? new Date().getFullYear());
  const [genres, setGenres] = useState<string[]>(movie?.genres ?? []);
  const [director, setDirector] = useState(movie?.director ?? '');
  const [rating, setRating] = useState(movie?.rating ?? 7);
  const [notes, setNotes] = useState(movie?.notes ?? '');
  const [haveCats, setHaveCats] = useState(movie?.haveCats ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mouseDownOnOverlay = useRef(false);

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

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
    setSubmitted(true);

    const newErrors = validate(title, year, genres, director, rating);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = FIELD_ORDER.find((f) => newErrors[f]);
      if (firstErrorField) {
        document.getElementById(`field-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    let imageFile: File | undefined;
    if (imageSrc && croppedAreaPixels) {
      imageFile = await cropImage(imageSrc, croppedAreaPixels);
    }

    onSubmit({
      title,
      year,
      genres,
      director,
      rating,
      notes: notes || undefined,
      haveCats,
      imageFile,
    });
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => { mouseDownOnOverlay.current = e.target === e.currentTarget; }}
      onMouseUp={(e) => { if (mouseDownOnOverlay.current && e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>
          {movie ? 'Edit Movie' : 'Add Movie'}
        </h2>
        {submitted && Object.keys(errors).length > 0 && (
          <div className={styles.errorSummary}>
            {Object.values(errors).map((msg) => (
              <p key={msg}>{msg}</p>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
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
          <div className={styles.field} id="field-title">
            <label className={styles.label}>Title</label>
            <input
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); clearError('title'); }}
              placeholder="e.g. The Shawshank Redemption"
            />
            {errors.title && <p className={styles.fieldError}>{errors.title}</p>}
          </div>
          <div className={styles.row}>
            <div className={styles.field} id="field-year">
              <label className={styles.label}>Year</label>
              <input
                className={`${styles.input} ${errors.year ? styles.inputError : ''}`}
                type="number"
                value={year}
                onChange={(e) => { setYear(Number(e.target.value)); clearError('year'); }}
                min={1888}
                max={2030}
              />
              {errors.year && <p className={styles.fieldError}>{errors.year}</p>}
            </div>
            <div className={styles.field} id="field-rating">
              <label className={styles.label}>Rating (1-10)</label>
              <input
                className={`${styles.input} ${errors.rating ? styles.inputError : ''}`}
                type="number"
                value={rating}
                onChange={(e) => { setRating(Number(e.target.value)); clearError('rating'); }}
                min={1}
                max={10}
                step={0.5}
              />
              {errors.rating && <p className={styles.fieldError}>{errors.rating}</p>}
            </div>
          </div>
          <div className={styles.field} id="field-genres">
            <label className={styles.label}>Genre</label>
            <GenreTagPicker
              selectedGenres={genres}
              onChange={(g) => { setGenres(g); clearError('genres'); }}
            />
            {errors.genres && <p className={styles.fieldError}>{errors.genres}</p>}
          </div>
          <div className={styles.field} id="field-director">
            <label className={styles.label}>Director</label>
            <input
              className={`${styles.input} ${errors.director ? styles.inputError : ''}`}
              type="text"
              value={director}
              onChange={(e) => { setDirector(e.target.value); clearError('director'); }}
              placeholder="e.g. Frank Darabont"
            />
            {errors.director && <p className={styles.fieldError}>{errors.director}</p>}
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
          <div className={styles.field}>
            <label className={styles.toggleRow}>
              <span className={styles.label} style={{ marginBottom: 0 }}>Has cats?</span>
              <button
                type="button"
                className={`${styles.toggle} ${haveCats ? styles.toggleOn : ''}`}
                onClick={() => setHaveCats(!haveCats)}
                role="switch"
                aria-checked={haveCats}
              >
                <span className={styles.toggleThumb} />
              </button>
            </label>
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
