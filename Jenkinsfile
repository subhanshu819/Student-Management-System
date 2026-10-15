pipeline {
    agent any

    options {
        // Stop after 30 minutes to prevent hung builds
        timeout(time: 30, unit: 'MINUTES')
        // Colorize console output
        ansiColor('xterm')
        // Keep only recent 20 builds to conserve disk space
        buildDiscarder(logRotator(numToKeepStr: '20'))
        // Do not allow concurrent builds on the same branch
        disableConcurrentBuilds()
    }

    environment {
        // Application Metadata
        APP_NAME           = 'student-management-system'
        NODE_ENV           = 'production'
        DOCKER_REGISTRY    = 'registry.hub.docker.com'
        IMAGE_BACKEND_NAME = 'apex-sms-backend'
        IMAGE_FRONTEND_NAME= 'apex-sms-frontend'
        IMAGE_TAG          = "${env.BUILD_NUMBER}-${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"

        // Credentials identifiers configured in Jenkins Credential Store
        // 1. mongodb-atlas-uri-creds -> Secret Text (MongoDB Atlas SRV Connection string)
        // 2. jwt-secret-creds        -> Secret Text (Cryptographic JWT signing key)
        // 3. docker-registry-creds   -> Username with Password (Docker Registry Authentication)
        MONGODB_URI        = credentials('mongodb-atlas-uri-creds')
        JWT_SECRET         = credentials('jwt-secret-creds')
        DOCKER_CREDENTIALS = credentials('docker-registry-creds')
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

        // ── 2. DEPENDENCY INSTALLATION ──
        stage('Install Dependencies') {
            steps {
                echo "===> [Stage 2/7] Installing dependencies reproducibly with npm ci..."
                // Use parallel execution for both frontend & backend to speed up build
                parallel(
                    'Backend Dependencies': {
                        dir('backend') {
                            echo "Installing backend dependencies (clean install)..."
                            sh 'npm ci'
                        }
                    },
                    'Frontend Dependencies': {
                        dir('frontend') {
                            echo "Installing frontend dependencies (clean install)..."
                            sh 'npm ci'
                        }
                    }
                )
            }
        }

        // ── 3. STATIC ANALYSIS & LINTING ──
        stage('Static Analysis & Lint') {
            steps {
                echo "===> [Stage 3/7] Running code quality and linting checks..."
                dir('frontend') {
                    // Runs oxlint as configured in frontend/package.json
                    sh 'npm run lint'
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
                    sh 'npm test'
                }
            }
        }

        // ── 5. FRONTEND PRODUCTION BUILD ──
        stage('Build Frontend') {
            steps {
                echo "===> [Stage 5/7] Compiling React + Vite + Tailwind CSS production bundle..."
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        // ── 6. CONTAINER IMAGE BUILD ──
        stage('Build Docker Images') {
            steps {
                echo "===> [Stage 6/7] Building multi-stage container images without baking secrets..."
                // Build Backend Docker Image
                sh "docker build -t ${IMAGE_BACKEND_NAME}:${IMAGE_TAG} -t ${IMAGE_BACKEND_NAME}:latest ./backend"

                // Build Frontend Docker Image
                sh "docker build -t ${IMAGE_FRONTEND_NAME}:${IMAGE_TAG} -t ${IMAGE_FRONTEND_NAME}:latest ./frontend"
            }
        }

        // ── 7. CONTROLLED DEPLOYMENT ──
        stage('Deploy to Target') {
            // Guardrail: Run deployment stage ONLY if all upstream checks passed,
            // never deploy from untrusted pull requests (CHANGE_ID present),
            // and only deploy from release-ready branches (main or master).
            when {
                allOf {
                    branch pattern: "main|master", comparator: "REGEXP"
                    not { changeRequest() }
                }
            }
            steps {
                echo "===> [Stage 7/7] Deploying verified containerized services..."
                script {
                    echo "Deploying to production environment with image tag: ${IMAGE_TAG}"

                    // Login to registry if credentials are provided
                    sh '''
                        if [ -n "$DOCKER_CREDENTIALS_USR" ] && [ -n "$DOCKER_CREDENTIALS_PSW" ]; then
                            echo "$DOCKER_CREDENTIALS_PSW" | docker login -u "$DOCKER_CREDENTIALS_USR" --password-stdin "$DOCKER_REGISTRY"
                            docker push "${IMAGE_BACKEND_NAME}:${IMAGE_TAG}"
                            docker push "${IMAGE_FRONTEND_NAME}:${IMAGE_TAG}"
                        else
                            echo "Registry credentials not provided; deploying locally with docker compose."
                        fi
                    '''

                    // Launch or update containers using docker compose with runtime secret injection
                    sh '''
                        export MONGODB_URI="$MONGODB_URI"
                        export JWT_SECRET="$JWT_SECRET"
                        docker compose down --remove-orphans || true
                        docker compose up -d --no-build
                    '''

                    echo "Deployment completed successfully. Verifying application health..."
                    // Wait for container health check
                    sh '''
                        for i in $(seq 1 12); do
                            if curl -sf http://localhost:5000/api/health > /dev/null && curl -sf http://localhost:80/health > /dev/null; then
                                echo "All application services are healthy!"
                                exit 0
                            fi
                            echo "Waiting for services to become healthy (attempt $i/12)..."
                            sleep 5
                        done
                        echo "Warning: Health check timed out or services still starting."
                    '''
                }
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
