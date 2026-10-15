pipeline {
    agent any

    options {
        // Stop after 30 minutes to prevent hung builds
        timeout(time: 30, unit: 'MINUTES')
        // Keep only recent 20 builds to conserve disk space
        buildDiscarder(logRotator(numToKeepStr: '20'))
        // Do not allow concurrent builds on the same branch
        disableConcurrentBuilds()
    }

    environment {
        // Application Metadata
        APP_NAME           = 'student-management-system'
        NODE_ENV           = 'production'
        IMAGE_BACKEND_NAME = 'apex-sms-backend'
        IMAGE_FRONTEND_NAME= 'apex-sms-frontend'
        IMAGE_TAG          = "${env.BUILD_NUMBER}-${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"
    }

    stages {
        // ── 1. SOURCE CHECKOUT ──
        stage('Checkout Source') {
            steps {
                echo "===> [Stage 1/7] Checking out repository source code..."
                checkout scm
                script {
                    def commitHash = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'local'
                    echo "Checked out branch: ${env.BRANCH_NAME ?: 'main'} (Commit: ${commitHash})"
                }
            }
        }

        // ── 2. DEPENDENCY INSTALLATION (PARALLEL DECLARATIVE) ──
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo "Installing backend dependencies (clean install)..."
                        dir('backend') {
                            bat 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo "Installing frontend dependencies (clean install)..."
                        dir('frontend') {
                            bat 'npm ci'
                        }
                    }
                }
            }
        }

        // ── 3. STATIC ANALYSIS & LINTING ──
        stage('Static Analysis & Lint') {
            steps {
                echo "===> [Stage 3/7] Running code quality and linting checks..."
                dir('frontend') {
                    // Runs oxlint as configured in frontend/package.json
                    bat 'npm run lint'
                }
            }
        }

        // ── 4. AUTOMATED BACKEND TESTS ──
        stage('Automated Tests') {
            steps {
                echo "===> [Stage 4/7] Running automated unit & integration tests..."
                dir('backend') {
                    // Executes built-in Node test runner across health, auth, role-authorization and student CRUD
                    // Tests run in-memory using mockDb; zero production database interference
                    bat 'npm test'
                }
            }
        }

        // ── 5. FRONTEND PRODUCTION BUILD ──
        stage('Build Frontend') {
            steps {
                echo "===> [Stage 5/7] Compiling React + Vite + Tailwind CSS production bundle..."
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        // ── 6. CONTAINER IMAGE BUILD ──
        stage('Build Docker Images') {
            steps {
                echo "===> [Stage 6/7] Building multi-stage container images..."
                // Build Backend Docker Image
                bat "docker build -t %IMAGE_BACKEND_NAME%:%IMAGE_TAG% -t %IMAGE_BACKEND_NAME%:latest ./backend"

                // Build Frontend Docker Image
                bat "docker build -t %IMAGE_FRONTEND_NAME%:%IMAGE_TAG% -t %IMAGE_FRONTEND_NAME%:latest ./frontend"
            }
        }

        // ── 7. DEPLOYMENT (SAFELY SKIPPED FOR CI RELIABILITY) ──
        stage('Deploy') {
            steps {
                echo "===> [Stage 7/7] Deployment & publishing skipped for initial CI pipeline stability."
                bat 'echo Deployment and Docker Hub publishing are disabled. Focus is on reliable CI validation.'
            }
        }
    }

    // ── POST-BUILD ACTIONS & REPORTING ──
    post {
        always {
            echo "Pipeline execution finished for build #${env.BUILD_NUMBER} (${currentBuild.currentResult})."
            cleanWs deleteDirs: true, notFailBuild: true
        }
        success {
            echo "SUCCESS: Pipeline completed successfully! Build #${env.BUILD_NUMBER} is green."
        }
        unstable {
            echo "WARNING: Build #${env.BUILD_NUMBER} marked as UNSTABLE (e.g. test warnings)."
        }
        failure {
            echo "FAILURE: Build #${env.BUILD_NUMBER} FAILED during stage '${STAGE_NAME ?: 'Unknown'}'. Please check the console output above for error logs."
        }
        aborted {
            echo "ABORTED: Build #${env.BUILD_NUMBER} was aborted by user or timeout."
        }
    }
}
